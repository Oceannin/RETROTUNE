"""Loopback-only metadata bridge and OBS overlay host."""
import asyncio
import base64
from datetime import datetime, timezone
import json
import logging
import math
from pathlib import Path
import secrets
import time

from aiohttp import web

ROOT = Path(__file__).resolve().parent
DATA = ROOT / 'data'
DEFAULTS = dict(language='ru', layout='classic', theme='cloud', width=620, coverSize=112, radius=0,
                accent='#192c9d', background='#d4d4e5', text='#191b44', secondary='#555678',
                progressColor='#ffcf66', borderColor='#25234d', showCover=True,
                showTitle=True, showArtist=True, showProgress=True, showTime=True,
                showHeader=True, showDisc=False, showStatus=True, spin=True,
                marquee=True, marqueeSpeed=35, gap=20, padding=20, fontSize=23,
                coverRadius=0, opacity=100, hidePaused=False, emptyMode='hide',
                source='auto', order=['art', 'info'])


def validate_settings(raw):
    if not isinstance(raw, dict):
        raise ValueError('Ожидается объект настроек')
    result = dict(DEFAULTS)
    enums = {'language': ['ru', 'en'], 'layout': ['classic', 'vertical', 'disc', 'minimal', 'custom'],
             'theme': ['cloud', 'night', 'mint', 'rose'], 'emptyMode': ['hide', 'message']}
    limits = {'width': (220, 1200), 'coverSize': (48, 240), 'radius': (0, 48),
              'coverRadius': (0, 120), 'marqueeSpeed': (10, 100), 'gap': (0, 60),
              'padding': (0, 60), 'fontSize': (12, 48), 'opacity': (0, 100)}
    for key, value in raw.items():
        if key not in result:
            raise ValueError('Неизвестная настройка: ' + key)
        if key in enums and value not in enums[key]:
            raise ValueError('Неверное значение: ' + key)
        if key in limits:
            lo, hi = limits[key]
            if type(value) not in (int, float) or not math.isfinite(value) or not lo <= value <= hi:
                raise ValueError('Значение вне диапазона: ' + key)
        if key in ['accent', 'background', 'text', 'secondary', 'progressColor', 'borderColor']:
            if not isinstance(value, str) or len(value) != 7 or value[0] != '#' or any(c not in '0123456789abcdefABCDEF' for c in value[1:]):
                raise ValueError('Ожидается HEX-цвет: ' + key)
        if type(result[key]) is bool and type(value) is not bool:
            raise ValueError('Ожидается переключатель: ' + key)
        if key == 'source' and (not isinstance(value, str) or len(value) > 512):
            raise ValueError('Неверный источник')
        if key == 'order' and value not in [['art', 'info'], ['info', 'art']]:
            raise ValueError('Неверный порядок блоков')
        result[key] = value
    return result


class Bridge:
    def __init__(self):
        DATA.mkdir(exist_ok=True)
        self.settings = dict(DEFAULTS)
        try:
            self.settings = validate_settings(json.loads((DATA / 'settings.json').read_text('utf-8')))
        except (OSError, ValueError):
            pass
        token_file = DATA / 'token.txt'
        if not token_file.exists():
            token_file.write_text(secrets.token_urlsafe(32), 'utf-8')
        self.token = token_file.read_text('utf-8').strip()
        self.windows = []
        self.external = {}
        self.windows_status = 'Подключение к Windows…'
        self.manager = None
        self.cover_cache = {}

    def sources(self):
        now = time.time()
        self.external = {k: v for k, v in self.external.items() if now - v['receivedAt'] < 12}
        return self.windows + list(self.external.values())

    def state(self):
        sources = self.sources()
        selected = self.settings['source']
        # Explicit selection never leaks another app's song when its source disappears.
        track = next((s for s in sources if s['id'] == selected), None)
        if selected == 'auto':
            track = next((s for s in sources if s['playing']), sources[0] if sources else None)
        return dict(settings=self.settings, track=track, serverTime=time.time())

    async def poll_windows(self):
        while True:
            await self._poll_windows_once()
            await asyncio.sleep(3)

    async def _poll_windows_once(self):
        try:
            from winrt.windows.media.control import GlobalSystemMediaTransportControlsSessionManager as Manager
            from winrt.windows.storage.streams import DataReader
            self.manager = await Manager.request_async()
            while True:
                found = []
                live_covers = {}
                counts = {}
                for session in self.manager.get_sessions():
                    try:
                        appid = session.source_app_user_model_id
                        index = counts.get(appid, 0)
                        counts[appid] = index + 1
                        sid = f'windows:{appid}:{index}'
                        props = await asyncio.wait_for(session.try_get_media_properties_async(), 2)
                        timeline = session.get_timeline_properties()
                        playback = session.get_playback_info()
                        playing = int(playback.playback_status) == 4
                        rate = playback.playback_rate
                        rate = rate.value if hasattr(rate, 'value') else rate
                        rate = float(rate) if rate is not None else 1.0
                        start = timeline.start_time.total_seconds()
                        duration = max(0, timeline.end_time.total_seconds() - start)
                        position = max(0, timeline.position.total_seconds() - start)
                        if playing and duration:
                            age = max(0, (datetime.now(timezone.utc) - timeline.last_updated_time).total_seconds())
                            position += age * rate
                        key = (sid, props.title, props.artist, props.album_title)
                        cover = self.cover_cache.get(key, '')
                        if (key not in self.cover_cache or (not cover and time.monotonic() % 5 < 1)) and props.thumbnail:
                            stream = await asyncio.wait_for(props.thumbnail.open_read_async(), 2)
                            try:
                                if stream.size <= 2_000_000:
                                    reader = DataReader(stream.get_input_stream_at(0))
                                    try:
                                        await reader.load_async(stream.size)
                                        buf = bytearray(stream.size)
                                        reader.read_bytes(buf)
                                        cover = 'data:image/png;base64,' + base64.b64encode(buf).decode()
                                    finally:
                                        reader.close()
                            finally:
                                stream.close()
                        live_covers[key] = cover
                        found.append(dict(id=sid, kind='windows', label=appid, title=props.title,
                                          artist=props.artist, album=props.album_title, cover=cover,
                                          position=min(position, duration) if duration else 0,
                                          duration=duration, playing=playing, rate=rate, sampledAt=time.time()))
                    except Exception as exc:
                        logging.warning('Media session unavailable: %s', type(exc).__name__)
                self.windows = found
                self.cover_cache = live_covers
                self.windows_status = 'Windows подключена' if found else 'Windows подключена · нет медиасессий'
                await asyncio.sleep(1)
        except asyncio.CancelledError:
            raise
        except Exception as exc:
            self.windows = []
            self.manager = None
            self.windows_status = 'Windows недоступна · ' + type(exc).__name__
            logging.exception('Windows media bridge failed')


bridge = None


@web.middleware
async def guard(request, handler):
    # Reject DNS rebinding, cross-site writes, and large payloads.
    if request.host not in ['127.0.0.1:47832', 'localhost:47832']:
        raise web.HTTPForbidden(text='Loopback only')
    if request.method in ['POST', 'PUT', 'DELETE']:
        token = request.headers.get('X-Retrotune-Token', '')
        if not secrets.compare_digest(token, bridge.token):
            return web.json_response({'error': 'Неверный ключ подключения'}, status=403)
    try:
        response = await handler(request)
    except (ValueError, TypeError, KeyError) as exc:
        return web.json_response({'error': str(exc)}, status=400)
    response.headers['Cache-Control'] = 'no-store'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    return response


async def bootstrap(request):
    return web.json_response(dict(**bridge.state(), sources=bridge.sources(), token=bridge.token,
                                  windowsStatus=bridge.windows_status))


async def state(request):
    return web.json_response(bridge.state())


async def settings(request):
    value = validate_settings(await request.json())
    temp = DATA / 'settings.tmp'
    temp.write_text(json.dumps(value, ensure_ascii=False, indent=2), 'utf-8')
    temp.replace(DATA / 'settings.json')
    bridge.settings = value
    return web.json_response(value)


def normalize_track(raw):
    if not isinstance(raw, dict):
        raise ValueError('Ожидается объект трека')
    result = {}
    for key, limit in [('id', 200), ('label', 500), ('title', 2000), ('artist', 1000), ('album', 1000), ('cover', 2_800_000)]:
        value = raw.get(key, '')
        if not isinstance(value, str) or len(value) > limit:
            raise ValueError('Неверное поле: ' + key)
        result[key] = value
    if not result['id'] or result['id'] in ['auto', 'demo'] or result['id'].startswith('windows:'):
        raise ValueError('Используйте собственный id источника')
    cover = result['cover']
    if cover and not (cover.startswith('https://') or cover.startswith(('data:image/png;base64,', 'data:image/jpeg;base64,', 'data:image/webp;base64,'))):
        raise ValueError('Обложка: HTTPS или PNG/JPEG/WebP data URL')
    for key in ['position', 'duration', 'rate']:
        value = raw.get(key, 1 if key == 'rate' else 0)
        if type(value) not in (int, float) or not math.isfinite(value) or value < 0 or value > (16 if key == 'rate' else 10_000_000):
            raise ValueError('Неверное время или скорость: ' + key)
        result[key] = value
    if type(raw.get('playing', False)) is not bool:
        raise ValueError('playing должен быть boolean')
    result.update(playing=raw.get('playing', False), kind='browser' if result['id'].startswith('browser:') else 'external',
                  sampledAt=time.time(), receivedAt=time.time())
    result['position'] = min(result['position'], result['duration']) if result['duration'] else 0
    return result


async def ingest(request):
    track = normalize_track(await request.json())
    if len(bridge.external) >= 64 and track['id'] not in bridge.external:
        raise ValueError('Достигнут лимит 64 источников')
    bridge.external[track['id']] = track
    return web.json_response({'ok': True})


async def remove_source(request):
    body = await request.json()
    bridge.external.pop(body['id'], None)
    return web.json_response({'ok': True})


async def static(request):
    path = request.match_info.get('path', '')
    if not path or path == 'overlay':
        path = 'index.html'
    target = (ROOT / 'dist' / path).resolve()
    if not target.is_relative_to((ROOT / 'dist').resolve()) or not target.is_file():
        raise web.HTTPNotFound()
    return web.FileResponse(target)


async def lifecycle(app):
    task = asyncio.create_task(bridge.poll_windows())
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


def create_app():
    global bridge
    bridge = Bridge()
    app = web.Application(middlewares=[guard], client_max_size=3_000_000)
    app.router.add_get('/api/bootstrap', bootstrap)
    app.router.add_get('/api/state', state)
    app.router.add_put('/api/settings', settings)
    app.router.add_post('/api/ingest', ingest)
    app.router.add_post('/api/remove-source', remove_source)
    app.router.add_get('/{path:.*}', static)
    app.cleanup_ctx.append(lifecycle)
    return app


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    web.run_app(create_app(), host='127.0.0.1', port=47832, access_log=None)
