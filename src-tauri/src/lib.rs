use std::process::Command;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![buildupj, packageupj])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn buildupj(project_name: String, project_path: String) -> String {

    let output = if cfg!(target_os = "windows") {

        let command = format!(
            "./Engine/Build/BatchFiles/Build.bat {} Shipping Win64 \"{}\" -waitmutex",
            project_name, project_path
        );

        Command::new("powershell")
            .args(["/C", command.as_str()])
            .output()
            .expect("Failed to build unreal project.")
    } else {

        let command = format!(
            "./Engine/Build/BatchFiles/Mac/Build.sh {} Shipping Mac \"{}\" -waitmutex",
            project_name, project_path
        );

        Command::new("sh")
            .arg("-c")
            .arg(command.as_str())
            .output()
            .expect("Failed to build unreal project.")
    };

    if output.status.success() {
        "Build success".to_string()
    } else {
        format!("Build error: {}", output.status.to_string())
    }

}

#[tauri::command]
fn packageupj() {
    println!("HelloWorld !");
}
