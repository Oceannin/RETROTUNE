obs = obslua
language = 'en'
function text(en, ru) if language == 'ru' then return ru else return en end end
function script_description()
 return '<h2>♫ RETROTUNE</h2><p>' .. text('A retro now-playing widget. The local service starts when this script loads.','Музыкальный виджет в стиле ретроокна. Сервис запускается при загрузке скрипта.') .. '</p><p>' .. text('Editor / dock','Редактор / док-панель') .. ': http://127.0.0.1:47832<br>Overlay: http://127.0.0.1:47832/overlay</p>'
end
function launch()
 local root = script_path() .. '..\\Start-RETROTUNE.ps1'
 os.execute('start "" /b powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' .. root .. '" -NoBrowser')
end
function open_editor() os.execute('start "" "http://127.0.0.1:47832"'); return true end
function add_source()
 local current = obs.obs_frontend_get_current_scene()
 if current == nil then obs.script_log(obs.LOG_WARNING,text('Select an OBS scene first.','Сначала выберите сцену OBS.')); return true end
 local scene = obs.obs_scene_from_source(current)
 local name = 'RETROTUNE — музыка'
 local existing = obs.obs_get_source_by_name(name)
 if existing ~= nil then
  if obs.obs_scene_find_source(scene,name) == nil then obs.obs_scene_add(scene,existing) end
  obs.obs_source_release(existing)
 else
  local settings = obs.obs_data_create()
  obs.obs_data_set_string(settings,'url','http://127.0.0.1:47832/overlay')
  obs.obs_data_set_int(settings,'width',1280)
  obs.obs_data_set_int(settings,'height',720)
  obs.obs_data_set_int(settings,'fps',60)
  obs.obs_data_set_bool(settings,'shutdown',false)
  obs.obs_data_set_bool(settings,'reroute_audio',false)
  local source = obs.obs_source_create('browser_source',name,settings,nil)
  if source ~= nil then obs.obs_scene_add(scene,source); obs.obs_source_release(source) end
  obs.obs_data_release(settings)
 end
 obs.obs_source_release(current)
 return true
end
function script_properties()
 local props=obs.obs_properties_create()
 local languages=obs.obs_properties_add_list(props,'language','Language / Язык',obs.OBS_COMBO_TYPE_LIST,obs.OBS_COMBO_FORMAT_STRING)
 obs.obs_property_list_add_string(languages,'English','en')
 obs.obs_property_list_add_string(languages,'Русский','ru')
 obs.obs_properties_add_button(props,'editor',text('Open editor','Открыть редактор'),open_editor)
 obs.obs_properties_add_button(props,'add',text('Add widget to the current scene','Добавить виджет в текущую сцену'),add_source)
 obs.obs_properties_add_button(props,'launch',text('Start service','Запустить сервис'),function() launch(); return true end)
 return props
end
function script_defaults(settings) obs.obs_data_set_default_string(settings,'language','en') end
function script_update(settings) language=obs.obs_data_get_string(settings,'language') end
function script_load(settings) script_update(settings); launch() end
