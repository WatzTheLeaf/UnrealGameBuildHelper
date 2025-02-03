const { open } = window.__TAURI__.dialog;
const { readTextFile} = window.__TAURI__.fs;
const invoke = window.__TAURI__.core.invoke;

// Logic for select project button
document.getElementById("select-uproject").addEventListener("click", ()=>{
  const path = open({
    multiple: false,
    directory: false,
    canCreateDirectories: false,
    title: "Uproject Selector",
    filters: 
      [{name : "Unreal Project File", extensions: ['uproject']}]
    }).then(async (result)=>{
      if (result != null) {
        if (await GetDetails(result))
          {
            HideSelection();
            ShowDetails();
          }
      }
    })
})

// Hide select project button
function HideSelection(){
  document.getElementById("select-uproject").style.display = "none";
}

// Show project details interface
function ShowDetails(){
  document.getElementById("main").style.opacity = 1;
}

// Retrive details from the uproject file (FRONTEND logic)
async function GetDetails(path){
  try {
    const uproject = await readTextFile(path, {})
    let content = JSON.parse(uproject);

    console.log(content);

    const title = path.match(/[^\\/]+(?=\.[^.]+$)/);
    document.getElementById("project-title").innerText = title;
    
    if (JSON.stringify(content.EngineAssociation).includes("{")){
      document.getElementById("unreal-version").innerText = "Unreal from source " + content.EngineAssociation
    } else {
      document.getElementById("unreal-version").innerText = "Unreal " + content.EngineAssociation
    }

    let plugins = "Plugins : ";
    content.Plugins.forEach(plugin => {
      if (plugin.Enabled){
        plugins += (plugin.Name + ", ");
      }
    });
    document.getElementById("project-plugins").innerText = plugins.slice(0,-2)

    // Build project button behavior. Use rust backend to manage commands
    document.getElementById("build-uproject").addEventListener("click", ()=>{
      invoke("buildupj", {projectName: title.toString(), projectPath: path}).then((message) => alert(message));
    })
    
    // Package project button behavior. Use rust backend to manage commands
    document.getElementById("package-uproject").addEventListener("click", ()=>{
      invoke("packageupj", {projectPath: path}).then((message) => alert(message));
    })

    return true
  } 
  catch (error) {
    alert("Unable to parse uproject file (" + error + ")")
    return false
  }
}