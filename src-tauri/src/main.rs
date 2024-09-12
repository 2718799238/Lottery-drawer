#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use calamine::{open_workbook_auto, DataType, Reader};
use rust_xlsxwriter::*;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::path::PathBuf;
use tauri::Manager;

#[derive(Serialize, Deserialize)]
struct ExcelData {
    file_path: String,
    sheet: Vec<Vec<Value>>,
}

#[tauri::command]
fn read_excel(file_path: String) -> Result<ExcelData, String> {
    let path = PathBuf::from(file_path.clone());

    if !path.exists() {
        return Err(format!("File not found: {}", file_path));
    }

    let mut workbook = open_workbook_auto(&path).map_err(|e| e.to_string())?;

    let sheet_name = workbook
        .sheet_names()
        .get(0)
        .ok_or("No sheets found")?
        .to_string();

    let range = workbook
        .worksheet_range(&sheet_name)
        .ok_or("Cannot find sheet")?
        .map_err(|e| e.to_string())?;

    let data: Vec<Vec<Value>> = range
        .rows()
        .map(|row| {
            row.iter()
                .map(|cell| match cell {
                    DataType::Empty => Value::Null,
                    DataType::String(s) => Value::String(s.to_string()),
                    DataType::Float(f) => {
                        Value::Number(serde_json::Number::from_f64(*f).unwrap_or(0.into()))
                    }
                    DataType::Int(i) => Value::Number((*i).into()),
                    DataType::Bool(b) => Value::Bool(*b),
                    _ => Value::Null,
                })
                .collect()
        })
        .filter(|row: &Vec<Value>| !row.is_empty())
        .collect();

    Ok(ExcelData {
        file_path,
        sheet: data,
    })
}

#[tauri::command]
fn update_excel(file_path: String, new_sheets: Vec<Vec<Value>>) -> Result<(), String> {
    let path = PathBuf::from(file_path);
    // println!("path: {:?}", path);
    // println!("new_sheets: {:?}", new_sheets);
    // 创建一个工作簿
    let mut workbook = Workbook::new();

    // 创建一个工作表
    let mut worksheet = workbook.add_worksheet();

    // 设置工作表的列宽度
    worksheet
        .set_column_width(0, 23)
        .map_err(|e| e.to_string())?;

    worksheet
        .set_column_width(1, 10)
        .map_err(|e| e.to_string())?; // B列
    worksheet
        .set_column_width(2, 10)
        .map_err(|e| e.to_string())?; // C列
    worksheet
        .set_column_width(3, 10)
        .map_err(|e| e.to_string())?; // D列

    // 创建一个居中对齐的格式
    let mut center_format = Format::new()
        .set_align(FormatAlign::Center)
        .set_border(FormatBorder::Thin)
        .set_border_color(Color::Black);

    // 合并第一行的前三列并设置格式
    let merged_cell_content = match &new_sheets[0][0] {
        Value::String(s) => s.as_str(),
        _ => "",
    };
    worksheet
        .merge_range(0, 0, 0, 3, merged_cell_content, &center_format)
        .map_err(|e| e.to_string())?;
    // 遍历新的sheet数据，并且添加到工作表中
    for (row, row_data) in new_sheets.iter().enumerate() {
        let start_col = if row == 0 { 4 } else { 0 };
        for (col, cell_data) in row_data.iter().enumerate().skip(start_col) {
            match cell_data {
                Value::Null => {}
                Value::Number(n) => {
                    if let Some(i) = n.as_i64() {
                        worksheet
                            .write_number(row as u32, col as u16, i as f64)
                            .map_err(|e| e.to_string())?;
                    } else if let Some(f) = n.as_f64() {
                        worksheet
                            .write_number(row as u32, col as u16, f)
                            .map_err(|e| e.to_string())?;
                    }
                }
                Value::String(s) => {
                    worksheet
                        .write_string(row as u32, col as u16, s)
                        .map_err(|e| e.to_string())?;
                }
                _ => {
                    return Err(format!(
                        "Unsupported data type at row {}, column {}",
                        row, col
                    ))
                }
            }
        }
    }

    // 保存工作簿
    workbook.save(path).map_err(|e| e.to_string())?;

    Ok(())
}
fn main() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![read_excel, update_excel])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
