"""Create a source+build delivery without local settings, tokens or environments."""
from pathlib import Path
import json
import zipfile

root=Path(__file__).resolve().parents[1]
version=json.loads((root/'package.json').read_text('utf-8'))['version']
target=root/f'output/retrotune-v{version}.zip'
target.parent.mkdir(exist_ok=True)
folders=['src','public','dist','browser-extension','obs','tests','tools','docs']
files=['package.json','package-lock.json','tsconfig.json','vite.config.js','index.html',
       'requirements.txt','server.py','README.md','README.ru.md','LICENSE','CHANGELOG.md','VERIFICATION.md','.gitignore',
       'Start RETROTUNE.cmd','Start-RETROTUNE.ps1','Stop RETROTUNE.cmd','Stop-RETROTUNE.ps1','Setup RETROTUNE.cmd','Create-Desktop-Shortcut.ps1']
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED) as archive:
    for name in files:
        archive.write(root/name,'RETROTUNE/'+name)
    for folder in folders:
        for path in sorted((root/folder).rglob('*')):
            if path.is_file() and '__pycache__' not in path.parts and path.name != 'extension-config.json':
                archive.write(path,'RETROTUNE/'+path.relative_to(root).as_posix())
with zipfile.ZipFile(target) as archive:
    assert archive.testzip() is None
    assert not any('/data/' in n or '/.venv/' in n or '/node_modules/' in n for n in archive.namelist())
    print(f'{target}: {len(archive.namelist())} files, {target.stat().st_size} bytes')
