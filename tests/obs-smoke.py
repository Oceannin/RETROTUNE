"""Read active outputs, then verify a browser source in a separate inactive scene."""
import asyncio
import base64
import hashlib
import json
import os
from pathlib import Path
import time
from aiohttp import ClientSession

ROOT=Path(__file__).resolve().parents[1]


async def main():
    config_path=Path(os.environ['APPDATA'])/'obs-studio/plugin_config/obs-websocket/config.json'
    config=json.loads(config_path.read_text('utf-8'))
    async with ClientSession() as session:
        async with session.ws_connect(f"http://127.0.0.1:{config['server_port']}") as ws:
            hello=(await ws.receive_json())['d']
            identify={'rpcVersion':1,'eventSubscriptions':0}
            if 'authentication' in hello:
                auth=hello['authentication']
                secret=base64.b64encode(hashlib.sha256((config['server_password']+auth['salt']).encode()).digest()).decode()
                identify['authentication']=base64.b64encode(hashlib.sha256((secret+auth['challenge']).encode()).digest()).decode()
            await ws.send_json({'op':1,'d':identify})
            assert (await ws.receive_json())['op']==2
            async def call(kind,data=None):
                rid=str(time.time_ns())
                await ws.send_json({'op':6,'d':{'requestType':kind,'requestId':rid,'requestData':data or {}}})
                while True:
                    msg=await ws.receive_json()
                    if msg['op']==7 and msg['d']['requestId']==rid:
                        result=msg['d']
                        assert result['requestStatus']['result'],result['requestStatus']
                        return result.get('responseData',{})
            outputs={k:(await call(k))['outputActive'] for k in ['GetStreamStatus','GetRecordStatus']}
            current=(await call('GetCurrentProgramScene'))['currentProgramSceneName']
            studio=(await call('GetStudioModeEnabled'))['studioModeEnabled']
            previous_preview=(await call('GetCurrentPreviewScene'))['currentPreviewSceneName'] if studio else current
            scene='RETROTUNE — виджет'
            source='RETROTUNE — музыка'
            scenes=(await call('GetSceneList'))['scenes']
            if not any(s['sceneName']==scene for s in scenes):
                await call('CreateScene',{'sceneName':scene})
            inputs=(await call('GetInputList'))['inputs']
            if not any(s['inputName']==source for s in inputs):
                await call('CreateInput',{'sceneName':scene,'inputName':source,'inputKind':'browser_source',
                    'inputSettings':{'url':'http://127.0.0.1:47832/overlay','width':1280,'height':720,'fps':60,'shutdown':False,'reroute_audio':False},'sceneItemEnabled':True})
            # Synthetic metadata is scoped to the test and restored in finally.
            bootstrap=await (await session.get('http://127.0.0.1:47832/api/bootstrap')).json()
            headers={'X-Retrotune-Token':bootstrap['token']}
            async def settings(value):
                r=await session.put('http://127.0.0.1:47832/api/settings',headers=headers,json=value)
                assert r.status==200
            try:
                await call('SetInputSettings',{'inputName':source,'inputSettings':{'url':f'http://127.0.0.1:47832/overlay?verify={time.time_ns()}'},'overlay':True})
                if not studio:
                    await call('SetStudioModeEnabled',{'studioModeEnabled':True})
                await call('SetCurrentPreviewScene',{'sceneName':scene})
                await settings({**bootstrap['settings'],'source':'test:obs','showDisc':True})
                r=await session.post('http://127.0.0.1:47832/api/ingest',headers=headers,json={
                    'id':'test:obs','title':'Облачный город · проверка OBS','artist':'RETROTUNE · native browser source',
                    'label':'OBS smoke test','duration':224,'position':87,'playing':True})
                assert r.status==200
                await asyncio.sleep(3)
                screenshot=await call('GetSourceScreenshot',{'sourceName':source,'imageFormat':'png','imageWidth':1280,'imageHeight':720})
                (ROOT/'output/playwright/obs-native.png').write_bytes(base64.b64decode(screenshot['imageData'].split(',',1)[1]))
                assert (await call('GetCurrentProgramScene'))['currentProgramSceneName']==current,'Program scene changed'
                for kind, active in outputs.items():
                    assert (await call(kind))['outputActive']==active,'Output state changed'
                print(json.dumps({'scene':scene,'source':source,'programScenePreserved':True,'outputsBefore':outputs,'screenshot':'output/playwright/obs-native.png'},ensure_ascii=False))
            finally:
                await settings(bootstrap['settings'])
                await session.post('http://127.0.0.1:47832/api/remove-source',headers=headers,json={'id':'test:obs'})
                await call('SetInputSettings',{'inputName':source,'inputSettings':{'url':'http://127.0.0.1:47832/overlay'},'overlay':True})
                await call('SetCurrentPreviewScene',{'sceneName':previous_preview})
                if not studio:
                    await call('SetStudioModeEnabled',{'studioModeEnabled':False})


asyncio.run(main())
