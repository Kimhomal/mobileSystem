package am.common.web;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.poi.hssf.usermodel.HSSFDataFormat;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFDataFormat;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.servlet.view.AbstractView;

import am.common.web.StrUtils;

public class ExcelSheetDataDownView extends AbstractView {
    private static final Logger logger = LoggerFactory.getLogger(ExcelSheetDataDownView.class);

    private static final String CONTENT_TYPE_XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    @Override
    protected void renderMergedOutputModel(Map<String, Object> model, HttpServletRequest request, HttpServletResponse response) throws Exception 
    {
        XSSFWorkbook workbook = new XSSFWorkbook();
        logger.info("Created Excel Workbook from scratch");

        this.setContentType(CONTENT_TYPE_XLSX);

        // =========================== Model 객체 Start ==========================
        // header 정보
        @SuppressWarnings("unchecked")
        List<String> headerList = (List<String>) model.get("headerList");
        // 컬럼 타입
        List<Integer> columnTypeList = (List<Integer>) model.get("columnTypeList");
        // 컬럼 넓이
        List<Integer> columnWidthList = (List<Integer>) model.get("columnWidthList");
        // sheet 정보
        List<String> sheetNameList = (List<String>) model.get("sheetNameList");
        // data filter key 정보
        List<String> filterKeys = (List<String>) model.get("filterKey");
        // body 정보
        @SuppressWarnings("unchecked")
        List<Object> sheetDataList = (List<Object>) model.get("dataList");

        // 타이틀 정보
        boolean useTitle = false;
        int rowStart = 0;
        if (model.get("title") != null) {
            useTitle = true;
            rowStart = 2;
        }

        // Set the filename
        String sFilename = "";
        if (model.get("filename") != null) {
            sFilename = (String) model.get("filename");
        } else if (request.getAttribute("filename") != null) {
            sFilename = (String) request.getAttribute("filename");
        } else {
            sFilename = getClass().getSimpleName();
        }
        // =========================== Model 객체 End ==========================

        // =========================== Sheet 정의 Start ==========================
        for (int sheetNum = 0; sheetNum < sheetNameList.size(); sheetNum++) {
            String sheetName = (String) sheetNameList.get(sheetNum);
            XSSFSheet sheet = workbook.createSheet(sheetName);

            for (int colSize = 0; colSize < columnWidthList.size(); colSize++) {
                Integer integerColWidth = (Integer) columnWidthList.get(colSize);
                int colWidth = integerColWidth.intValue();
                sheet.setColumnWidth(colSize, colWidth);
            }

            if (useTitle == true) {
                // 타이틀 ROW 셀 병합
                sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, headerList.size() - 1));
            }
            // =========================== Sheet 정의 Start ==========================

            XSSFCell cell = null;

            // =========================== Title Start ==========================
            if (useTitle == true) {
                // put text in first cell
                CellStyle titleStyle = workbook.createCellStyle();
                titleStyle.setAlignment(CellStyle.ALIGN_CENTER);

                // 폰트
                Font titleFont = workbook.createFont();
                titleFont.setFontHeightInPoints((short) 14);
                //		titleFont.setUnderline(Font.U_SINGLE);
                titleFont.setBoldweight(Font.BOLDWEIGHT_BOLD);
                titleFont.setColor(IndexedColors.DARK_RED.getIndex());
                titleStyle.setFont(titleFont);

                // set title information
                cell = this.getCell(sheet, 0, 0);
                cell.setCellStyle(titleStyle);
                this.setText(cell, (String) model.get("title"));
            }
            // =========================== Title End ==========================

            // ================= Header 정의 ===================
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setBorderLeft(CellStyle.BORDER_THIN);
            headerStyle.setBorderTop(CellStyle.BORDER_THIN);
            headerStyle.setBorderRight(CellStyle.BORDER_THIN);
            headerStyle.setBorderBottom(CellStyle.BORDER_THIN);
            headerStyle.setAlignment(CellStyle.ALIGN_CENTER);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_GREEN.index);
            headerStyle.setFillPattern(CellStyle.SOLID_FOREGROUND);    // 색 패턴 설정

            Font headerFont = workbook.createFont();
            headerFont.setBoldweight(Font.BOLDWEIGHT_BOLD);
            headerStyle.setFont(headerFont);

            // set header information
            for (int i = 0; i < headerList.size(); i++) {
                cell = getCell(sheet, rowStart, i);
                cell.setCellStyle(headerStyle);
                this.setText(cell, headerList.get(i));
            }
            // ================= Header 정의 ===================

            // ================= body 정의 ===================
            XSSFCellStyle bodyStyle = workbook.createCellStyle();
            bodyStyle.setBorderLeft(BorderStyle.THIN);
            bodyStyle.setBorderTop(BorderStyle.THIN);
            bodyStyle.setBorderRight(BorderStyle.THIN);
            bodyStyle.setBorderBottom(BorderStyle.THIN);
            
            XSSFCellStyle decimalPointStyle = workbook.createCellStyle();
            decimalPointStyle.setBorderLeft(BorderStyle.THIN);
            decimalPointStyle.setBorderTop(BorderStyle.THIN);
            decimalPointStyle.setBorderRight(BorderStyle.THIN);
            decimalPointStyle.setBorderBottom(BorderStyle.THIN);

            String key = null;
            int columnTypeValue;
            String cellValue = "";
            Map<String, Object> dataRow = null;

            // set body information
            List<?> dataList = (List<?>) sheetDataList.get(sheetNum);

            for (int iRow = 0; iRow < dataList.size(); iRow++) 
            {
            	dataRow = (Map<String, Object>) dataList.get(iRow);
            	for (int iCol = 0; iCol < filterKeys.size(); iCol++) 
            	{
            		key = filterKeys.get(iCol);
            		columnTypeValue = columnTypeList.get(iCol);

            		cell = getCell(sheet, (rowStart + 1) + iRow, iCol); //셀
            		cellValue = String.valueOf(dataRow.get(key));		//입력값 String
            		
            		if(StrUtils.isDecimalPoint(cellValue)){
            			setText(decimalPointStyle, cell, cellValue, columnTypeValue);
            		}else{
            			setText(bodyStyle, cell, cellValue, columnTypeValue);
            		}
            		
//            		setText(cell, cellValue);
                }
            }
        }

        String browser = request.getHeader("User-Agent");

        // 파일명 인코딩
        if (browser.contains("MSIE") || browser.contains("Trident") || browser.contains("Chrome")) {
            sFilename = URLEncoder.encode(sFilename, "UTF-8").replaceAll("\\+", "%20");
        } else {
            sFilename = new String(sFilename.getBytes("UTF-8"), "ISO-8859-1");
        }

        // Set the content type.
        response.setContentType(getContentType());
        response.setHeader("Content-Disposition", "attachment; filename=\"" + sFilename + ".xlsx\"");

        // Flush byte array to servlet output stream.
        ServletOutputStream out = response.getOutputStream();
        out.flush();
        workbook.write(out);
        out.flush();
    }

    /**
     * Convenient method to obtain the cell in the given sheet, row and column.
     * <p>
     * <p>Creates the row and the cell if they still doesn't already exist.
     * Thus, the column can be passed as an int, the method making the needed downcasts.</p>
     *
     * @param sheet a sheet object. The first sheet is usually obtained by workbook.getSheetAt(0)
     * @param row   thr row number
     * @param col   the column number
     * @return the XSSFCell
     */
    protected XSSFCell getCell(XSSFSheet sheet, int row, int col) {
        XSSFRow sheetRow = sheet.getRow(row);
        if (sheetRow == null) {
            sheetRow = sheet.createRow(row);
        }
        XSSFCell cell = sheetRow.getCell((short) col);
        if (cell == null) {
            cell = sheetRow.createCell((short) col);
        }
        return cell;
    }

    /**
     * Convenient method to set a String as text content in a cell.
     *
     * @param cell the cell in which the text must be put
     * @param text the text to put in the cell
     */
    protected void setText(XSSFCell cell, String text, XSSFWorkbook workbook, XSSFCellStyle cellStyle)
    {
    	if(StrUtils.isNumeric(text)){
        	XSSFDataFormat df = workbook.createDataFormat();
        	cellStyle.setDataFormat(df.getFormat("#,##0"));
        	
        	double d = Double.parseDouble(text.toString()) ;
        	cell.setCellType(CellType.NUMERIC);
        	cell.setCellValue(d);
        	cell.setCellStyle(cellStyle);
    	}else{
    		cell.setCellType(CellType.STRING);
    	}
        cell.setCellValue(text);
    }
    
    protected void setText(XSSFCell cell, String text)
    {
    	cell.setCellType(CellType.STRING);
        cell.setCellValue(text);
    }    

    protected void setText(XSSFCellStyle bodyStyle, XSSFCell cell, String cellValue, int columnTypeValue)
    {
    	if (cellValue == null || "null".equals(cellValue.trim())) {
            cellValue = "";
        }

        switch (columnTypeValue){
            case 1: //COLUMN_TYPE_STRING
            {
                cell.setCellType(CellType.STRING);
                cell.setCellStyle(bodyStyle);
                cell.setCellValue(cellValue);
                break;
            }
            case 2: //COLUMN_TYPE_INT
            {
                bodyStyle.setDataFormat(HSSFDataFormat.getBuiltinFormat("#,##0"));
                cell.setCellType(CellType.NUMERIC);
                cell.setCellStyle(bodyStyle);
                if(!cellValue.equals("")){
                	double d = Double.parseDouble(cellValue.toString());
                    cell.setCellValue(d);
                }else{
                	cell.setCellValue(cellValue);
                }
                break;
            }
            case 3: //COLUMN_TYPE_DOUBLE
            {
            	bodyStyle.setDataFormat(HSSFDataFormat.getBuiltinFormat("#,##0.0"));
            	cell.setCellType(CellType.NUMERIC);
            	cell.setCellStyle(bodyStyle);
            	if(!cellValue.equals(""))
                {
                	double d = Double.parseDouble(cellValue);
                    cell.setCellValue(d);
                }else{
                	cell.setCellValue(cellValue);
                }
                break;
            }
            case 4: //COLUMN_TYPE_DATE
            {
                int strSize = cellValue.length();

                if(strSize == 6){
                    cellValue = cellValue.substring(0, 4) + "." + cellValue.substring(4, 6);
                }else if(strSize == 8){
                    cellValue = cellValue.substring(0, 4) + "." + cellValue.substring(4, 6) + "." + cellValue.substring(6, 8);
                }
//                bodyStyle.setAlignment(HorizontalAlignment.CENTER);                
                cell.setCellType(CellType.STRING);
                cell.setCellStyle(bodyStyle);
                cell.setCellValue(cellValue);
                break;
            }
        }
    }
}
