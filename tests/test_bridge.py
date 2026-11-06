import asyncio
import json
import io
import math
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from aiohttp.test_utils import TestClient, TestServer
import server


class ValidationTests(unittest.TestCase):
    def test_settings_reject_invalid_boundaries(self):
        for raw in [{'language':'xx'}, {'width': -1}, {'opacity': math.nan}, {'showCover': 1}, {'text': 'red'}, {'order': ['art']}, {'unknown': 2}, {'layout': 'oops'}]:
            with self.subTest(raw=raw), self.assertRaises(ValueError):
                server.validate_settings(raw)

    def test_tracks_reject_unsafe_values(self):
        for patch_data in [{'cover': 'javascript:alert(1)'}, {'cover':'http://internal.local/image'}, {'position':float('inf')}, {'playing':'true'}, {'id':'windows:spoof:0'}]:
            with self.subTest(data=patch_data), self.assertRaises(ValueError):
                server.normalize_track({'id':'test', **patch_data})

    def test_progress_clamped_and_live_has_no_fake_duration(self):
        self.assertEqual(server.normalize_track({'id':'test','position':30,'duration':20})['position'],20)
        self.assertEqual(server.normalize_track({'id':'test','position':30})['position'],0)

    def test_old_presets_migrate_and_language_persists(self):
        self.assertEqual(server.validate_settings({'radius':12})['language'],'ru')
        self.assertEqual(server.validate_settings({'language':'en'})['language'],'en')


class APITests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.patcher = patch.object(server,'DATA',Path(self.temp.name))
        self.patcher.start()
        self.app = server.create_app()
        self.app.cleanup_ctx.clear()  # Deterministic API tests; real WinRT is checked separately.
        self.client = TestClient(TestServer(self.app))
        await self.client.start_server()
        self.headers = {'Host':'127.0.0.1:47832'}
        self.auth = dict(self.headers, **{'X-Retrotune-Token':server.bridge.token})

    async def asyncTearDown(self):
        await self.client.close()
        self.patcher.stop()
        self.temp.cleanup()

    async def test_auth_and_host_boundaries(self):
        self.assertEqual((await self.client.put('/api/settings',headers=self.headers,json={})).status,403)
        self.assertEqual((await self.client.get('/api/bootstrap',headers={'Host':'evil.example'})).status,403)
        response = await self.client.get('/api/bootstrap',headers=self.headers)
        self.assertEqual(response.status,200)
        self.assertIsNone(response.headers.get('Access-Control-Allow-Origin'))

    async def test_settings_persist_and_invalid_write_preserves_previous(self):
        response = await self.client.put('/api/settings',headers=self.auth,json={'radius':22,'source':'external:one'})
        self.assertEqual(response.status,200)
        self.assertEqual(json.loads((Path(self.temp.name)/'settings.json').read_text('utf-8'))['radius'],22)
        self.assertEqual((await self.client.put('/api/settings',headers=self.auth,json={'radius':90})).status,400)
        self.assertEqual(server.bridge.settings['radius'],22)
        self.assertEqual(server.Bridge().settings['radius'],22)

    async def test_switch_expire_and_explicit_source_never_falls_back(self):
        for sid in ['one','two']:
            response=await self.client.post('/api/ingest',headers=self.auth,json={'id':sid,'title':sid,'playing':True,'duration':200,'position':50})
            self.assertEqual(response.status,200)
        self.assertEqual(server.bridge.state()['track']['id'],'one')
        server.bridge.settings['source']='two'
        self.assertEqual(server.bridge.state()['track']['id'],'two')
        server.bridge.external['two']['receivedAt']-=13
        self.assertIsNone(server.bridge.state()['track'])
        server.bridge.settings['source']='auto'
        self.assertEqual(server.bridge.state()['track']['id'],'one')
        await self.client.post('/api/remove-source',headers=self.auth,json={'id':'one'})
        self.assertIsNone(server.bridge.state()['track'])

    async def test_malformed_and_oversize(self):
        self.assertEqual((await self.client.put('/api/settings',headers=self.auth,data='{')).status,400)
        self.assertEqual((await self.client.post('/api/ingest',headers=self.auth,json=[])).status,400)
        self.assertEqual((await self.client.post('/api/ingest',headers=self.auth,data=io.BytesIO(b'x'*3_000_001))).status,413)


if __name__=='__main__':
    unittest.main()
