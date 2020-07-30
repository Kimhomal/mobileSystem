package am.common.web;

import java.net.URLEncoder;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.servlet.view.AbstractView;

import egovframework.rte.fdl.excel.util.AbstractPOIExcelView;


/*
 * [셀병합]	
 * sheet.addMergedRegion(new CellRangeAddress(1, 1, 1, 2));	// 가로병합
 * sheet.addMergedRegion(new CellRangeAddress(1, 2, 1, 1));	// 세로병합
 *  
 * [틀고정] 
 * sheet.createFreezePane(1, 2);	// 1열, 2행 고정
 *
 * [셀 스타일]
 * CellStyle style = wb.createCellStyle();
 *
 * [가로 정렬]
 * style.setAlignment((short)1);			// 가로 정렬 왼쪽
 * style.setAlignment((short)2);			// 가로 정렬 중간
 * style.setAlignment((short)3);			// 가로 정렬 오른쪽
 *
 * [세로 정렬]
 * style.setVerticalAlignment((short)0);	// 세로 정렬 상단
 * style.setVerticalAlignment((short)1);	// 세로 정렬 중단
 * style.setVerticalAlignment((short)2);	// 세로 정렬 하단
 * 
 * [셀 스타일 적용]
 * cell.setCellStyle(style);
 * 
 * 
 * [폰트 설정]
 * Font font = wb.createFont();
 * font.setFontName("맑은 고딕");					// 폰트 이름
 * font.setFontHeightInPoints((short)20);		// 폰트 크기
 * font.setColor(IndexedColors.RED.getIndex());	// 폰트 컬러
 * font.setStrikeout(true);						// 글자 가운데 라인
 * font.setItalic(true);						// 이탤릭체
 * font.setUnderline(Font.U_SINGLE);			// 밑줄
 * font.setBoldweight(Font.BOLDWEIGHT_BOLD);	// 볼드체
 * style.setFont(font);
 * 
 * [컬럼 사이즈 자동 조절]
 * sheet.autoSizeColumn(0);
 * 
 */
public class XSSFExcelDownView extends AbstractView 
{
	private static final Logger logger  = LoggerFactory.getLogger(XSSFExcelDownView.class);
	
	/** The content type for an Excel response */
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
		
		// body 정보		
		@SuppressWarnings("unchecked")
		List<Object> dataList = (List<Object>) model.get("dataList");
		
		// data filter key 정보
		@SuppressWarnings("unchecked")
		List<Object> filterKeys = (List<Object>) model.get("filterKey");
		
        // 타이틀 정보
        boolean useTitle = false;
        int rowStart = 0;
        if(model.get("title") != null){
        	useTitle = true;
        	rowStart = 2;
        }
        
        // Set the filename
        String sFilename = "";
        if(model.get("filename") != null) 
        {
        	sFilename = (String)model.get("filename");
        }
        else if(request.getAttribute("filename") != null)
        {
        	sFilename = (String)request.getAttribute("filename");
        }
        else
        {
        	sFilename = getClass().getSimpleName();
        }
        
        // VO 객체를 사용하려고 하였으나..
        boolean isVO = false;
        if (dataList.size() > 0) {
        	Object obj = dataList.get(0);
//        	isVO = obj instanceof UserInfoVO;
        }
        
		// =========================== Model 객체 End ==========================
        
		// =========================== Sheet 정의 Start ========================== 
		XSSFSheet sheet = workbook.createSheet("sheet");
		sheet.autoSizeColumn(0);
//		sheet.setDefaultColumnWidth(12);
		
		if( useTitle == true )
		{
			// 타이틀 ROW 셀 병합
			sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, headerList.size() - 1) );
		}
		// =========================== Sheet 정의 Start ==========================
		
		XSSFCell cell = null;
		
		// =========================== Title Start ==========================
		if( useTitle == true )
		{
	        // put text in first cell
			CellStyle titleStyle = workbook.createCellStyle();
			titleStyle.setAlignment(CellStyle.ALIGN_CENTER);
			
			// 폰트
			Font titleFont = workbook.createFont();
			titleFont.setFontHeightInPoints((short)14 );
	//		titleFont.setUnderline(Font.U_SINGLE);
			titleFont.setBoldweight(Font.BOLDWEIGHT_BOLD);
			titleFont.setColor(IndexedColors.DARK_RED.getIndex());
			titleStyle.setFont(titleFont);
			
			// set title information
	        cell = this.getCell(sheet, 0, 0);
	        cell.setCellStyle(titleStyle );
	        this.setText(cell, (String)model.get("title"));
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
		headerStyle.setFillPattern(CellStyle.SOLID_FOREGROUND);	// 색 패턴 설정
		
		Font headerFont = workbook.createFont();
		headerFont.setBoldweight(Font.BOLDWEIGHT_BOLD);
		headerStyle.setFont(headerFont);
        
        // set header information
        for(int i = 0; i < headerList.size(); i++)
        {
        	cell = getCell(sheet, rowStart, i);
    		cell.setCellStyle(headerStyle);
    		this.setText(cell, headerList.get(i));
        }
		// ================= Header 정의 ===================
        
        // ================= body 정의 ===================
        CellStyle bodyStyle = workbook.createCellStyle();
        bodyStyle.setBorderLeft(CellStyle.BORDER_THIN);
        bodyStyle.setBorderTop(CellStyle.BORDER_THIN);
        bodyStyle.setBorderRight(CellStyle.BORDER_THIN);
        bodyStyle.setBorderBottom(CellStyle.BORDER_THIN);
        
        String key = null;
        String cellValue = "";
        Map<String, Object> category = null;
        
        // set body information
        for (int idx = 0; idx < dataList.size(); idx++) 
        {
        	if (isVO)	// VO 객체 
        	{
//        		UserInfoVO category = (UserInfoVO) dataList.get(i);
// 
//        		cell = getCell(sheet, 3 + idx, 0);
//        		setText(cell, category.getUser_id());
// 
//        		cell = getCell(sheet, 3 + idx, 1);
//        		setText(cell, category.getUser_name());
// 
//        		cell = getCell(sheet, 3 + idx, 2);
//        		setText(cell, category.getEnabled());
        	}
        	else	// Map 객체
        	{
//        		Map<String, Object> category = (Map<String, Object>) dataList.get(idx);
        		category = (Map<String, Object>) dataList.get(idx);
        		
        		for(int i = 0; i < filterKeys.size(); i++)
        		{
        			key = (String) filterKeys.get(i);
        			cell = getCell(sheet, (rowStart + 1) + idx, i);
            		cell.setCellStyle(bodyStyle);
            		cellValue = String.valueOf( category.get(key) );
            		
            		setText(cell, cellValue);
        		}
        	}
        }
        
        String browser = request.getHeader("User-Agent");
        
        // 파일명 인코딩
		if(browser.contains("MSIE") || browser.contains("Trident") || browser.contains("Chrome"))
		{
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
	 * 
	 * <p>Creates the row and the cell if they still doesn't already exist.
	 * Thus, the column can be passed as an int, the method making the needed downcasts.</p>
	 * 
	 * @param sheet a sheet object. The first sheet is usually obtained by workbook.getSheetAt(0)
	 * @param row thr row number
	 * @param col the column number
	 * @return the XSSFCell
	 */
	protected XSSFCell getCell(XSSFSheet sheet, int row, int col) 
	{
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
	protected void setText(XSSFCell cell, String text) {
		cell.setCellType(CellType.STRING  );
		cell.setCellValue(text);
	}
}
