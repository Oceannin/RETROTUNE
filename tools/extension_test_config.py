"""Create machine-local browser-test config without publishing personal paths."""
import argparse
import json
from pathlib import Path

parser=argparse.ArgumentParser()
parser.add_argument('--browser',required=True,help='Installed Chromium-family executable')
args=parser.parse_args()
root=Path(__file__).resolve().parents[1]
browser=Path(args.browser).resolve()
if not browser.is_file():
    parser.error('Browser executable was not found')
extension=(root/'browser-extension').as_posix()
config={'browser':{'browserName':'chromium','isolated':False,
    'userDataDir':(root/'output/extension-profile').as_posix(),
    'launchOptions':{'executablePath':str(browser),'headless':True,
        'args':[f'--disable-extensions-except={extension}',f'--load-extension={extension}','--autoplay-policy=no-user-gesture-required']},
    'contextOptions':{'viewport':{'width':1200,'height':800}}}}
target=root/'output/extension-config.json'
target.parent.mkdir(exist_ok=True)
target.write_text(json.dumps(config,indent=2),'utf-8')
print(target)
