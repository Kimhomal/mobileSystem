package am.common.util.com;

import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.hssf.util.HSSFColor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.DataFormat;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellRangeAddress;

import am.common.util.com.ComDateUtils;
import egovframework.rte.psl.dataaccess.util.EgovMap;

public class EgovExcel {

	@SuppressWarnings("deprecation")
	public static Map<String, CellStyle> createStyles(Workbook wb) {
		Map<String, CellStyle> styles = new HashMap<String, CellStyle>();

		CellStyle style;

		//숫자
		style = wb.createCellStyle();
		style.setBorderBottom(CellStyle.BORDER_THIN);
		style.setBorderTop(CellStyle.BORDER_THIN);
		style.setBorderLeft(CellStyle.BORDER_THIN);
		style.setBorderRight(CellStyle.BORDER_THIN);
		DataFormat format = wb.createDataFormat();
		style.setDataFormat(format.getFormat("#,##0.00"));
		style.setAlignment(CellStyle.ALIGN_CENTER);
		style.setVerticalAlignment(CellStyle.VERTICAL_CENTER);
		styles.put("number", style);

		//문자
		style = wb.createCellStyle();
		style.setBorderBottom(CellStyle.BORDER_THIN);
		style.setBorderTop(CellStyle.BORDER_THIN);
		style.setBorderLeft(CellStyle.BORDER_THIN);
		style.setBorderRight(CellStyle.BORDER_THIN);
		style.setAlignment(CellStyle.ALIGN_CENTER);
		style.setVerticalAlignment(CellStyle.VERTICAL_CENTER);
		styles.put("string", style);

		//헤더
		style = wb.createCellStyle();
		style.setVerticalAlignment(CellStyle.VERTICAL_CENTER);
		style.setBorderBottom(CellStyle.BORDER_THIN);
		style.setBorderTop(CellStyle.BORDER_THIN);
		style.setBorderLeft(CellStyle.BORDER_THIN);
		style.setBorderRight(CellStyle.BORDER_THIN);
		style.setFillBackgroundColor(HSSFColor.WHITE.index);
		style.setFillForegroundColor(HSSFColor.GREY_25_PERCENT.index);
		style.setFillPattern(CellStyle.SOLID_FOREGROUND);
		style.setAlignment(CellStyle.ALIGN_CENTER);
		Font font = wb.createFont();
//		font.setBoldweight(Font.BOLDWEIGHT_BOLD);
		font.setBold(true);
		style.setFont(font);
		styles.put("mapheader", style);

		Font searchFont = wb.createFont();
		searchFont.setFontHeightInPoints((short) 10);
//				headerFont.setBoldweight(Font.BOLDWEIGHT_BOLD);
		style = wb.createCellStyle();
		style.setAlignment(CellStyle.ALIGN_LEFT);
		style.setVerticalAlignment(CellStyle.VERTICAL_CENTER);
		style.setFillForegroundColor(HSSFColor.TAN.index);
		style.setFillPattern(CellStyle.SOLID_FOREGROUND);
		style.setBorderRight(CellStyle.BORDER_THIN);
		style.setRightBorderColor(IndexedColors.BLACK.getIndex());
		style.setBorderLeft(CellStyle.BORDER_THIN);
		style.setLeftBorderColor(IndexedColors.BLACK.getIndex());
		style.setBorderTop(CellStyle.BORDER_THIN);
		style.setTopBorderColor(IndexedColors.BLACK.getIndex());
		style.setBorderBottom(CellStyle.BORDER_THIN);
		style.setBottomBorderColor(IndexedColors.BLACK.getIndex());
		style.setFont(searchFont);
		styles.put("search", style);

		Font headerFont = wb.createFont();
		headerFont.setFontHeightInPoints((short) 10);
//				headerFont.setBoldweight(Font.BOLDWEIGHT_BOLD);
		style = wb.createCellStyle();
		style.setAlignment(CellStyle.ALIGN_CENTER);
		style.setVerticalAlignment(CellStyle.VERTICAL_CENTER);
		style.setFillForegroundColor(HSSFColor.TAN.index);
		style.setFillPattern(CellStyle.SOLID_FOREGROUND);
		style.setBorderRight(CellStyle.BORDER_THIN);
		style.setRightBorderColor(IndexedColors.BLACK.getIndex());
		style.setBorderLeft(CellStyle.BORDER_THIN);
		style.setLeftBorderColor(IndexedColors.BLACK.getIndex());
		style.setBorderTop(CellStyle.BORDER_THIN);
		style.setTopBorderColor(IndexedColors.BLACK.getIndex());
		style.setBorderBottom(CellStyle.BORDER_THIN);
		style.setBottomBorderColor(IndexedColors.BLACK.getIndex());
		style.setFont(headerFont);
		styles.put("header", style);

		Font cellFont = wb.createFont();
		cellFont.setFontHeightInPoints((short) 10);
		//		headerFont.setBoldweight(Font.BOLDWEIGHT_BOLD);
		style = wb.createCellStyle();
		style.setAlignment(CellStyle.ALIGN_LEFT);
		style.setVerticalAlignment(CellStyle.VERTICAL_CENTER);
		style.setBorderRight(CellStyle.BORDER_THIN);
		style.setRightBorderColor(IndexedColors.BLACK.getIndex());
		style.setBorderLeft(CellStyle.BORDER_THIN);
		style.setLeftBorderColor(IndexedColors.BLACK.getIndex());
		style.setBorderTop(CellStyle.BORDER_THIN);
		style.setTopBorderColor(IndexedColors.BLACK.getIndex());
		style.setBorderBottom(CellStyle.BORDER_THIN);
		style.setBottomBorderColor(IndexedColors.BLACK.getIndex());
		style.setFont(cellFont);
		styles.put("cell", style);

		Font titlefont = wb.createFont();
		titlefont.setFontHeightInPoints((short) 14);
//		titlefont.setBoldweight(Font.BOLDWEIGHT_BOLD);
		titlefont.setBold(true);
		style = wb.createCellStyle();
		style.setAlignment(CellStyle.ALIGN_CENTER);
		style.setVerticalAlignment(CellStyle.VERTICAL_CENTER);
		style.setWrapText(false);
		style.setFont(titlefont);
		styles.put("title", style);

		Font dateFont = wb.createFont();
		dateFont.setFontHeightInPoints((short) 10);
		style = wb.createCellStyle();
		style.setAlignment(CellStyle.ALIGN_RIGHT);
		style.setVerticalAlignment(CellStyle.VERTICAL_CENTER);
		style.setWrapText(false);
		styles.put("date", style);

		return styles;
	}

	public static void SetAutoColumnWidth(Sheet sheet, int StartCell, int EndCell) {
		for (int i = StartCell; i <= EndCell; i++) {
			sheet.autoSizeColumn(i);
			if(i == EndCell){
				sheet.setColumnWidth(i, (sheet.getColumnWidth(i)) + 1500);
			}else{
				sheet.setColumnWidth(i, (sheet.getColumnWidth(i)) + 1024);
			}

		}
	}

	/**
	 * @param sheet
	 * @param arrHeader
	 * @param ResultList
	 * @param StartRow
	 * @param StartCell
	 * @param wb
	 * @param titleName
	 * @param dateName
	 * @param searchRowCnt
	 * @param arr
	 * @param arrSearch1
	 * @param arrSearch2
	 * @param arrSearchContents
	 * @throws Exception
	 */
	public static void SetExcelList(Sheet sheet, String[] arrHeader, List<?> ResultList, int StartRow, int StartCell, Workbook wb, String titleName, String dateName, int searchRowCnt, int[] arr,
			String[] arrSearch1, String[] arrSearch2, String[] arrSearchContents) throws Exception {

		Map<String, CellStyle> styles = createStyles(wb);

		try {

			int CellNum = 0;

			for (int i = 0; i < arrHeader.length; i++) {

				String item = arrHeader[i];
				Row row = sheet.getRow(StartRow);
				if (row == null) {
					row = sheet.createRow(StartRow);
				}
				//				row.setHeightInPoints(18.00f);
				Cell cell = row.getCell(StartCell + CellNum);
				if (cell == null) {
					cell = row.createCell(StartCell + CellNum);
					cell.setCellStyle(styles.get("header"));
				}
				CellNum++;
				cell.setCellValue(item);
			}

			StartRow++;

			for (int i = 0; i < ResultList.size(); i++) {

				EgovMap Temp = (EgovMap) ResultList.get(i);

				Row row = sheet.getRow(StartRow + i);
				if (row == null) {
					row = sheet.createRow(StartRow + i);
				}
				CellNum = 0;
				for (Iterator<String> Header = Temp.keySet().iterator(); Header.hasNext();) {
					String item = Header.next();

					Cell cell = row.getCell(StartCell + CellNum);

					if (cell == null) {
						cell = row.createCell(StartCell + CellNum);
					}

					if (Temp.get(item) == null || Temp.get(item).equals("")) {
						cell.setCellValue("");
						cell.setCellStyle(styles.get("cell"));
					} else if (Temp.get(item) instanceof Integer) {

						cell.setCellValue((Integer) Temp.get(item));
						cell.setCellStyle(styles.get("cell"));
					} else if (Temp.get(item) instanceof Double) {

						cell.setCellValue((Double) Temp.get(item));
						cell.setCellStyle(styles.get("cell"));

					} else {
						cell.setCellValue(String.valueOf(Temp.get(item)));
						cell.setCellStyle(styles.get("cell"));
					}
					CellNum++;
				}
			}

			Row titleRow = sheet.createRow(0);
			Cell titleCell = titleRow.createCell(StartCell);
			titleCell.setCellValue(titleName);
			titleCell.setCellStyle(styles.get("title"));
			sheet.addMergedRegion(new CellRangeAddress(0, 0, StartCell, CellNum - 1));

			Row dateRow = sheet.createRow(StartRow - 2);
			Cell dateCell = dateRow.createCell(StartCell);
			dateCell.setCellValue(dateName);
			dateCell.setCellStyle(styles.get("date"));
			sheet.addMergedRegion(new CellRangeAddress(StartRow - 2, StartRow - 2, StartCell, CellNum - 1));

			int mergeCnt = 1;
			for (int i = 0; i < arr.length; i++) {

				Row row = sheet.getRow(mergeCnt);
				if (row == null) {
					row = sheet.createRow(mergeCnt);
				}
				Cell cell = row.getCell(0);
				if (cell == null) {
					cell = row.createCell(0);
					cell.setCellStyle(styles.get("header"));
				}
				if (arrSearch1.length == arr.length) {
					cell.setCellValue(arrSearch1[i]);
				}
				sheet.addMergedRegion(new CellRangeAddress(mergeCnt, mergeCnt + arr[i] - 1, 0, 0));
				mergeCnt = mergeCnt + arr[i];

			}

			for (int i = 1; i < searchRowCnt + 1; i++) {

				sheet.addMergedRegion(new CellRangeAddress(i, i, 2, CellNum - 1));

				for (int j = 0; j < 2; j++) {
					Row row = sheet.getRow(i);
					if (row == null) {
						row = sheet.createRow(i);
					}
					Cell cell = row.getCell(j);
					if (cell == null) {
						cell = row.createCell(j);
						cell.setCellStyle(styles.get("header"));
					}
					if (j == 1 && arrSearch2.length == searchRowCnt) {
						cell.setCellValue(arrSearch2[i - 1]);
					}
				}

				for (int j = 2; j < CellNum; j++) {
					Row row = sheet.getRow(i);
					if (row == null) {
						row = sheet.createRow(i);
					}
					Cell cell = row.getCell(j);
					if (cell == null) {
						cell = row.createCell(j);
						cell.setCellStyle(styles.get("cell"));
					}
				}

				Row searchRow = sheet.getRow(i);
				if (searchRow == null) {
					searchRow = sheet.createRow(i);
				}
				Cell searchCell = searchRow.getCell(2);
				if (searchCell == null) {
					searchCell = searchRow.createCell(2);
					//					searchCell.setCellStyle(styles.get("cell"));
				}

				searchCell.setCellValue(arrSearchContents[i - 1]);
			}

			SetAutoColumnWidth(sheet, StartCell, CellNum); //셀 너비 조정

		} catch (Exception ex) {
			// ex.printStackTrace();
		}

	}

	/**
	 * @param sheet
	 * @param arrHeader
	 * @param ResultList
	 * @param StartRow
	 * @param StartCell
	 * @param wb
	 * @param titleName
	 * @param dateName
	 * @param searchRowCnt
	 * @param arrSearch1
	 * @param arrSearchContents
	 * @throws Exception
	 */
	public static void SetExcelList(Sheet sheet, String[] arrHeader, List<?> ResultList, int StartRow, int StartCell, Workbook wb, String titleName, String dateName, int searchRowCnt,
			String[] arrSearch1, String[] arrSearchContents) throws Exception {

		Map<String, CellStyle> styles = createStyles(wb);

		try {

			int CellNum = 0;

			for (int i = 0; i < arrHeader.length; i++) {

				String item = arrHeader[i];
				Row row = sheet.getRow(StartRow);
				if (row == null) {
					row = sheet.createRow(StartRow);
				}
				Cell cell = row.getCell(StartCell + CellNum);
				if (cell == null) {
					cell = row.createCell(StartCell + CellNum);
					cell.setCellStyle(styles.get("header"));
				}
				CellNum++;
				cell.setCellValue(item);
			}

			StartRow++;

			for (int i = 0; i < ResultList.size(); i++) {

				EgovMap Temp = (EgovMap) ResultList.get(i);

				Row row = sheet.getRow(StartRow + i);
				if (row == null) {
					row = sheet.createRow(StartRow + i);
				}
				CellNum = 0;
				for (Iterator<String> Header = Temp.keySet().iterator(); Header.hasNext();) {
					String item = Header.next();

					Cell cell = row.getCell(StartCell + CellNum);

					if (cell == null) {
						cell = row.createCell(StartCell + CellNum);
					}

					if (Temp.get(item) == null || Temp.get(item).equals("")) {
						cell.setCellValue("");
						cell.setCellStyle(styles.get("cell"));
					} else if (Temp.get(item) instanceof Integer) {

						cell.setCellValue((Integer) Temp.get(item));
						cell.setCellStyle(styles.get("cell"));
					} else if (Temp.get(item) instanceof Double) {

						cell.setCellValue((Double) Temp.get(item));
						cell.setCellStyle(styles.get("cell"));

					} else {
						cell.setCellValue(String.valueOf(Temp.get(item)));
						cell.setCellStyle(styles.get("cell"));
					}
					CellNum++;
				}
			}

			Row titleRow = sheet.createRow(0);
			Cell titleCell = titleRow.createCell(StartCell);
			titleCell.setCellValue(titleName);
			titleCell.setCellStyle(styles.get("title"));
			sheet.addMergedRegion(new CellRangeAddress(0, 0, StartCell, CellNum - 1));

			Row dateRow = sheet.createRow(StartRow - 2);
			Cell dateCell = dateRow.createCell(StartCell);
			dateCell.setCellValue(dateName);
			dateCell.setCellStyle(styles.get("date"));
			sheet.addMergedRegion(new CellRangeAddress(StartRow - 2, StartRow - 2, StartCell, CellNum - 1));

			for (int i = 1; i < searchRowCnt + 1; i++) {

				sheet.addMergedRegion(new CellRangeAddress(i, i, 0, 1));
				sheet.addMergedRegion(new CellRangeAddress(i, i, 2, CellNum - 1));

				for (int j = 0; j < 2; j++) {
					Row row = sheet.getRow(i);
					if (row == null) {
						row = sheet.createRow(i);
					}
					Cell cell = row.getCell(j);
					if (cell == null) {
						cell = row.createCell(j);
						cell.setCellStyle(styles.get("header"));
					}
					if (j == 0 && arrSearch1.length == searchRowCnt) {
						cell.setCellValue(arrSearch1[i - 1]);
					}
				}

				for (int j = 2; j < CellNum; j++) {
					Row row = sheet.getRow(i);
					if (row == null) {
						row = sheet.createRow(i);
					}
					Cell cell = row.getCell(j);
					if (cell == null) {
						cell = row.createCell(j);
						cell.setCellStyle(styles.get("cell"));
					}
				}

				Row searchRow = sheet.getRow(i);
				if (searchRow == null) {
					searchRow = sheet.createRow(i);
				}
				Cell searchCell = searchRow.getCell(2);
				if (searchCell == null) {
					searchCell = searchRow.createCell(2);
				}

				searchCell.setCellValue(arrSearchContents[i - 1]);
			}

			SetAutoColumnWidth(sheet, StartCell, CellNum); //셀 너비 조정

		} catch (Exception ex) {
			// ex.printStackTrace();
		}

	}

	/**
	 * @param wb
	 * @param sheet
	 * @param arrHerder
	 * @param ResultList
	 * @param StartRow 리스트가 시작 row (2부터 시작해야함)
	 * @param StartCell 리스트 시작 cell
	 * @param titleName 엑셀 제목
	 * @throws Exception
	 */
	public static void SetExcelList(Workbook wb, Sheet sheet, String[] arrHerder, List<?> ResultList, int StartRow, int StartCell, String titleName) throws Exception {

		Map<String, CellStyle> styles = createStyles(wb);

		try {
			int CellNum = 0;

			Row row = sheet.getRow(StartRow);
			if (row == null) {
				row = sheet.createRow(StartRow);
			}

			for (int i = 0; i < arrHerder.length; i++) {
				Cell cell = row.getCell(StartCell + CellNum);
				if (cell == null) {
					cell = row.createCell(StartCell + CellNum);
					cell.setCellStyle(styles.get("mapheader"));
				}
				cell.setCellValue(arrHerder[i]);
				CellNum++;
			}
			StartRow++;
			for (int i = 0; i < ResultList.size(); i++) {

				EgovMap Temp = (EgovMap) ResultList.get(i);

				row = sheet.getRow(StartRow + i);
				if (row == null) {
					row = sheet.createRow(StartRow + i);
				}
				CellNum = 0;
				for (Iterator<String> Header = Temp.keySet().iterator(); Header.hasNext();) {
					String item = Header.next();

					Cell cell = row.getCell(StartCell + CellNum);

					if (cell == null) {
						cell = row.createCell(StartCell + CellNum);
					}

					if (Temp.get(item) == null) {
						cell.setCellValue("");
						cell.setCellStyle(styles.get("string"));
					} else if (Temp.get(item) instanceof Integer) {
						cell.setCellValue((Integer) Temp.get(item));
						cell.setCellStyle(styles.get("number"));
					} else if (Temp.get(item) instanceof Double) {
						cell.setCellValue((Double) Temp.get(item));
						cell.setCellStyle(styles.get("number"));
					} else {
						cell.setCellValue(String.valueOf(Temp.get(item)));
						cell.setCellStyle(styles.get("string"));
					}
					CellNum++;
				}
			}

			Row titleRow = sheet.createRow(StartRow - 3);
			Cell titleCell = titleRow.createCell(StartCell);
			titleCell.setCellValue(titleName);
			titleCell.setCellStyle(styles.get("title"));
			sheet.addMergedRegion(new CellRangeAddress(StartRow - 3, StartRow - 3, StartCell, CellNum - 1));

			Row dateRow = sheet.createRow(StartRow - 2);
			Cell dateCell = dateRow.createCell(StartCell);
			dateCell.setCellValue("출력일 : " + ComDateUtils.getCurDate());
			dateCell.setCellStyle(styles.get("date"));
			sheet.addMergedRegion(new CellRangeAddress(StartRow - 2, StartRow - 2, StartCell, CellNum - 1));

			SetAutoColumnWidth(sheet, StartCell, CellNum);
		} catch (Exception ex) {
			// ex.printStackTrace();
		}
	}

	/**
	 * 엑셀 다운로드
	 *
	 * @param sheet
	 *            시트명
	 * @param arrHeader
	 *            리스트 헤더명
	 * @param ResultList
	 *            리스트
	 * @param StartRow
	 *            시작 row
	 * @param StartCell
	 *            시작 cell
	 * @param wb
	 * @param titleName
	 *            제목
	 * @throws Exception
	 */
	public static void SetExcelList(Sheet sheet, String[] arrHeader, List<?> ResultList, int StartRow, int StartCell, Workbook wb, String titleName) throws Exception {

		Map<String, CellStyle> styles = createStyles(wb);

		try {

			int CellNum = 0;

			for (int i = 0; i < arrHeader.length; i++) {

				String item = arrHeader[i];
				Row row = sheet.getRow(StartRow);
				if (row == null) {
					row = sheet.createRow(StartRow);
				}
				Cell cell = row.getCell(StartCell + CellNum);
				if (cell == null) {
					cell = row.createCell(StartCell + CellNum);
					cell.setCellStyle(styles.get("header"));
				}
				CellNum++;
				cell.setCellValue(item);
			}

			StartRow++;

			for (int i = 0; i < ResultList.size(); i++) {

				EgovMap Temp = (EgovMap) ResultList.get(i);

				Row row = sheet.getRow(StartRow + i);
				if (row == null) {
					row = sheet.createRow(StartRow + i);
				}
				CellNum = 0;
				for (Iterator<String> Header = Temp.keySet().iterator(); Header.hasNext();) {
					String item = Header.next();

					Cell cell = row.getCell(StartCell + CellNum);

					if (cell == null) {
						cell = row.createCell(StartCell + CellNum);
					}

					if (Temp.get(item) == null || Temp.get(item).equals("")) {
						cell.setCellValue("");
						cell.setCellStyle(styles.get("cell"));
					} else if (Temp.get(item) instanceof Integer) {

						cell.setCellValue((Integer) Temp.get(item));
						cell.setCellStyle(styles.get("cell"));
					} else if (Temp.get(item) instanceof Double) {

						cell.setCellValue((Double) Temp.get(item));
						cell.setCellStyle(styles.get("cell"));

					} else {
						cell.setCellValue(String.valueOf(Temp.get(item)));
						cell.setCellStyle(styles.get("cell"));
					}
					CellNum++;
				}
			}

			Row titleRow = sheet.createRow(StartRow - 1);
			Cell titleCell = titleRow.createCell(StartCell);
			titleCell.setCellValue(titleName);
			titleCell.setCellStyle(styles.get("title"));
			sheet.addMergedRegion(new CellRangeAddress(0, 0, StartCell, CellNum - 1));

			SetAutoColumnWidth(sheet, StartCell, CellNum); //셀 너비 조정

		} catch (Exception ex) {
			// ex.printStackTrace();
		}

	}

	/**
	 * 엑셀 다운로드 (공통함수)
	 *
	 * @param wb
	 * @param sheet
	 * @param arryHerder
	 * @param ResultList
	 * @param StartRow
	 * @param StartCell
	 * @throws Exception
	 */
	public static void SetExcelList(Workbook wb, Sheet sheet, String[] arryHerder, List<?> ResultList, int StartRow, int StartCell) throws Exception {

		Map<String, CellStyle> styles = createStyles(wb);

		try {
			int CellNum = 0;

			Row row = sheet.getRow(StartRow);
			if (row == null) {
				row = sheet.createRow(StartRow);
			}

			for (int i = 0; i < arryHerder.length; i++) {
				Cell cell = row.getCell(StartCell + CellNum);
				if (cell == null) {
					cell = row.createCell(StartCell + CellNum);
					cell.setCellStyle(styles.get("mapheader"));
				}
				cell.setCellValue(arryHerder[i]);
				CellNum++;
			}
			StartRow++;
			for (int i = 0; i < ResultList.size(); i++) {

				EgovMap Temp = (EgovMap) ResultList.get(i);

				row = sheet.getRow(StartRow + i);
				if (row == null) {
					row = sheet.createRow(StartRow + i);
				}
				CellNum = 0;
				for (Iterator<String> Header = Temp.keySet().iterator(); Header.hasNext();) {
					String item = Header.next();

					Cell cell = row.getCell(StartCell + CellNum);

					if (cell == null) {
						cell = row.createCell(StartCell + CellNum);
					}

					if (Temp.get(item) == null) {
						cell.setCellValue("");
						cell.setCellStyle(styles.get("string"));
					} else if (Temp.get(item) instanceof Integer) {
						cell.setCellValue((Integer) Temp.get(item));
						cell.setCellStyle(styles.get("number"));
					} else if (Temp.get(item) instanceof Double) {
						cell.setCellValue((Double) Temp.get(item));
						cell.setCellStyle(styles.get("number"));
					} else {
						cell.setCellValue(String.valueOf(Temp.get(item)));
						cell.setCellStyle(styles.get("string"));
					}
					CellNum++;
				}
			}

//			mergedCell(sheet, 1, ResultList.size(), 0, 4);

			SetAutoColumnWidth(sheet, StartCell, CellNum);
		} catch (Exception ex) {
			 ex.printStackTrace();
		}
	}

	public static String getExcelValue(Sheet sheet, int nRow, int nCol) {

		String result = "";
		try {
			Row row = sheet.getRow(nRow);
			if (row == null) {
				row = sheet.createRow(nRow);
			}
			Cell cell = row.getCell(nCol);
			if (cell == null) { // CELL이 없으면 바로 위 행의 ROW의 CELL 스타일을 가지고 옴.
				cell = row.createCell(nCol);
			}
			row = sheet.getRow(nRow);
			cell = row.getCell(nCol);

			if (cell.getCellType() == 0) {
				if (DateUtil.isCellDateFormatted(cell)) {
					SimpleDateFormat fomatter = new SimpleDateFormat("yyyy-MM-dd");
					result = fomatter.format(cell.getDateCellValue());
				} else {
					cell.setCellType(Cell.CELL_TYPE_STRING);
					result = cell.getStringCellValue();
				}
			} else if (cell.getCellType() == 1) {
				result = cell.getStringCellValue();
			} else if (cell.getCellType() == 4) {
				result = String.valueOf(cell.getBooleanCellValue());
			}

		} catch (Exception e) {
			// e.printStackTrace();
		}

		return result;
	}

	public static void mergedCell (Sheet sheet, int startRow, int endRow, int startCol, int endCol) {

		for(int i=startCol; i<endCol; i+=2){
			Iterator<Row> rowIterator = sheet.iterator();
			Row row = rowIterator.next();
			String value = "";
			String temp = "";
			int sumRows = 1;
			int sRow = startRow;

			while(rowIterator.hasNext()) {
				row = rowIterator.next();
				value = row.getCell(i).getStringCellValue();

				if(row.getRowNum() > 1) {
					if(value == temp) {
						sumRows++;
						if(sumRows == endRow){
							sheet.addMergedRegion(new CellRangeAddress(sRow, sumRows, i, i));
							sheet.addMergedRegion(new CellRangeAddress(sRow, sumRows, i+1, i+1));
						}
					} else {
						temp = value;
						if(sRow != sumRows){
							sheet.addMergedRegion(new CellRangeAddress(sRow, sumRows, i, i));
							sheet.addMergedRegion(new CellRangeAddress(sRow, sumRows, i+1, i+1));
						}
						sRow = sumRows+1;
						sumRows++;
					}
				} else {
					temp = value;
				}
			}
		}
	}

	public static void buildExcelDocument(Map<String, Object> model,HSSFWorkbook workbook, HttpServletRequest request,	HttpServletResponse response) throws Exception {

		List<?> dataList =(List<?>)model.get("dataList");

		String[] arrHeader = (String[])model.get("arrHeader");

		HSSFSheet sheet = workbook.createSheet((String)model.get("sheetName"));

		SetExcelList(workbook, sheet, arrHeader, dataList, 0, 0);

		response.setContentType("application/vnd.ms-excel");
		response.setHeader("Content-disposition", "attachment;filename=" + URLEncoder.encode((String)model.get("fileName") + ComDateUtils.getCurDateTime(), "UTF-8") + ".xls" + ";");
		ServletOutputStream myOut = response.getOutputStream();
		workbook.write(myOut); // 파일 저장

	}

}
