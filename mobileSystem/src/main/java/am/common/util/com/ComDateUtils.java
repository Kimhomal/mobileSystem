package am.common.util.com;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ComDateUtils {
	
	private static final Logger LOGGER = LoggerFactory.getLogger(ComDateUtils.class);

	
	/**
	 * <pre>
	 * Oracle의 Date type을 String형으로 저장한 데이터를 Date type으로 변환
	 * </pre>
	 *
	 * @param String
	 *            Oracle의 Date type을 String형으로 저장한 변수
	 * @return Date Date형으로 변환된 날짜정보
	 */
	public static Date toDate(String strDate) {
		
		return toDate(strDate, "yyyy-MM-dd hh:mm:ss");
	}
	
	/**
	 * <pre>
	 * 지정한 날짜형식(Pattern)의 날짜정보를 담은 문자열을 Date 형으로 변환
	 * </pre>
	 *
	 * @param String
	 *            날짜정보를 담은 문자열
	 * @param String
	 *            날짜형식 (SimpleDateFormat의 Time Format Syntax 참조)
	 * @return Date Date형으로 변환된 날짜정보
	 */
	public static Date toDate(String strDate, String pattern) {
		
		Date rtnDate = null;
		
		if (strDate == null || strDate.equals("")) {
			return null;
		}
		if (pattern == null) {
			return null;
		}
		
		try {
			SimpleDateFormat formatter = new SimpleDateFormat(pattern, Locale.KOREA);
			rtnDate = formatter.parse(strDate);
		} catch (ParseException e) {
			LOGGER.debug("Exception: " + e.toString());
		}
		
		return rtnDate;
	}
	
	/**
	 * <pre>
	 * Date type을 원하는 날짜형식(Pattern)의 문자열로 변환
	 * </pre>
	 *
	 * @param Date
	 *            날짜데이터
	 * @param String
	 *            날짜형식(Pattern) (SimpleDateFormat의 Time Format Syntax 참조)
	 * @return String 날짜정보의 문자열
	 */
	public static String toString(Date date, String pattern) {
		
		String strDate = "";
		SimpleDateFormat formatter = new SimpleDateFormat(pattern, new Locale("ko", "KOREA"));
		
		if (date != null) {
			
			strDate = formatter.format(date);
			
		}
		
		return strDate;
	}
	
	/**
	 * 입력받은 날짜문자열을 입력한 구분자로 나누어줌.
	 *
	 * @param datestr
	 * @param len
	 *            자리수 (예를 들어 날짜까지면 8, 년월이면 6, 시분초까지는 14, 밀리세컨까지는 17 자리)
	 * @return 초기화된 문자열
	 */
	public static String getDateString(String datestr, int len, String dateDelim, String timeDelim) {
		String datestring = "";
		if (datestr == null || datestr.trim().equals("")) {
			datestring = "";
		} else if (datestr.trim().length() < len) {
			datestring = "";
		} else {
			if (len == 4 && datestr.length() >= 4) {
				datestring = datestr.substring(0, 4);
			} else if (len == 6 && datestr.length() >= 6) {
				datestring = new StringBuffer(datestr.substring(0, 4)).append(dateDelim).append(datestr.substring(4, 6)).toString();
			} else if (len == 8 && datestr.length() >= 8) {
				datestring = new StringBuffer(datestr.substring(0, 4)).append(dateDelim).append(datestr.substring(4, 6)).append(dateDelim).append(datestr.substring(6, 8)).toString();
			} else if (len == 14 && datestr.length() >= 14) {
				datestring = new StringBuffer(datestr.substring(0, 4)).append(dateDelim).append(datestr.substring(4, 6)).append(dateDelim).append(datestr.substring(6, 8)).append(" ").append(datestr.substring(8, 10)).append(timeDelim).append(datestr.substring(10, 12)).append(timeDelim).append(datestr.substring(12, 14)).toString();
			} else if (len == 17 && datestr.length() >= 17) {
				datestring = new StringBuffer(datestr.substring(0, 4)).append(dateDelim).append(datestr.substring(4, 6)).append(dateDelim).append(datestr.substring(6, 8)).append(" ").append(datestr.substring(8, 10)).append(timeDelim).append(datestr.substring(10, 12)).append(timeDelim).append(datestr.substring(12, 14)).append(".").append(datestr.substring(15)).toString();
			}
		}
		return datestring;
	}
	
	/**
	 * 입력받은 날짜문자열을 입력한 구분자로 나누어줌.
	 *
	 * @param datestr
	 *            입력받은 날짜문자열
	 * @param seperate
	 *            구분자
	 * @param len
	 *            substring 할 길이
	 * @return 초기화된 문자열
	 */
	public static String getDateString(String datestr, String seperate, int len) {
		return getDateString(datestr, len, seperate, ":");
	}
	
	/**
	 * 입력받은 날짜문자열을 입력한 구분자로 나누어줌.
	 * JSP에서 좀더 간단히 쓰기 위해..
	 *
	 * @param datestr
	 *            (대상 날짜 String)
	 * @param len
	 *            자리수 (예를 들어 날짜까지면 8, 년월이면 6, 시분초까지는 14)
	 * @return 초기화된 문자열
	 *
	 */
	public static String getDateString(String strDate, int len) {
		return getDateString(strDate, len, ".", ":");
	}
	
	/**
	 * 현재 시각을 yyyy.MM.dd 포맷으로 반환
	 *
	 * @return yyyy.MM.dd
	 */
	public static String getCurDate() {
		return getFormatDateString("yyyy.MM.dd");
	}
	
	/**
	 * 현재 시각을 입력받은 포맷으로 반환
	 *
	 * @author 김광숙
	 * @serialData 2004.01.27
	 *
	 * @param 넘겨
	 *            받고 싶은 날짜의 format 예) "yyyy.MM"
	 * @return string
	 */
	public static String getCurDate(String strFormat) {
		return getFormatDateString(strFormat);
	}
	
	/**
	 * 현재 시각을 yyyyMMddHHmmss 포맷으로 반환
	 *
	 * @return yyyyMMddHHmmss
	 */
	public static String getCurDateTime() {
		return getFormatDateString("yyyyMMddHHmmss");
	}
	
	/**
	 * 현재 시각을 yyyyMMddHHmmssSSS 포맷으로 반환
	 *
	 * @return yyyyMMddHHmmssSSS
	 */
	public static String getCurFullDateTime() {
		return getFormatDateString("yyyyMMddHHmmssSSS");
	}
	
	/**
	 * 현재 시각을 원하는 포맷으로 반환
	 *
	 * @return Formatted DateTimeString
	 */
	public static String getFormatDateString(String pattern) {
		SimpleDateFormat formatter = new SimpleDateFormat(pattern, Locale.KOREA);
		String dateString = formatter.format(new Date());
		return dateString;
	}
	
	/**
	 * 현재 시각을 원하는 포맷으로 반환
	 *
	 * @return Formatted DateTimeString
	 */
	public static String getFormatDateString(String date, String pattern) {
		String dateString = "";
		
		if (date != null && date.length() > 0 && pattern != null && pattern.length() > 0) {
			SimpleDateFormat formatter = new SimpleDateFormat(pattern, Locale.KOREA);
			dateString = formatter.format(toDate(date, pattern));
		}
		
		return dateString;
	}
	
	public static String getFormatDateString(String date, String pattern, String afterPattern) {
		if (date == null || date.length() == 0) return "";
		SimpleDateFormat formatter = new SimpleDateFormat(afterPattern, Locale.KOREA);
		String dateString = formatter.format(toDate(date, pattern));
		return dateString;
	}
	
	/**
	 * 특정년월의 달력을 만드는 경우 필요한 Row 수를 읽어 온다.
	 *
	 * @author 김광숙
	 * @serialData 2004.01.27
	 *
	 * @param String형
	 *            년월 혹은 년월일
	 * @return int형 달력을 만들때 필요한 달력의 row 수를 읽어 준다.
	 */
	public static int getRowCountOfMonth(String sourceMonth) {
		
		String jobDay = sourceMonth.substring(0, 6) + "01";
		int startWeek = 0;
		int lastDay = 0;
		int rowCnt = 0;
		
		startWeek = getIntWeek(jobDay);
		lastDay = getLastDayOfMonth(jobDay);
		
		rowCnt = (startWeek + lastDay - 1) / 7;
		if (((startWeek + lastDay - 1) % 7) > 0) {
			rowCnt = rowCnt + 1;
		}
		
		return rowCnt;
	}
	
	/**
	 * 특정년월의 마지막 일자를 읽어 온다.
	 *
	 *
	 * @param String형
	 *            년월 혹은 년월일
	 * @return int형 해당월의 마지막 날짜를 int 값으로 반환
	 */
	public static int getLastDayOfMonth(String sourceMonth) {
		String jobDay = sourceMonth.substring(0, 6) + "01";
		
		Calendar cal = getDate(jobDay);
		
		return cal.getActualMaximum(Calendar.DAY_OF_MONTH);
	}
	
	/**
	 * Int 형으로 요일을 반환
	 *
	 * @param Date형
	 *            날짜
	 * @return int형 일 = 1, 월 = 2, 화 = 3, 수 = 4, 목 = 5, 금 = 6, 토 = 7
	 */
	public static int getIntWeek(Date sourceDay) {
		return getIntWeek(toString(sourceDay, "yyyyMMdd"));
	}
	
	/**
	 * Int 형으로 요일을 반환
	 * 
	 * @param 일자
	 *            "20040101"
	 * @return int형 일 = 1, 월 = 2, 화 = 3, 수 = 4, 목 = 5, 금 = 6, 토 = 7
	 */
	
	public static int getIntWeek(String sourceDay) {
		int strWeekDay = 0;
		
		if (sourceDay == null || sourceDay.length() < 8) {
			return 0;
		}
		
		Calendar cal = getDate(sourceDay);
		
		strWeekDay = cal.get(Calendar.DAY_OF_WEEK);
		return strWeekDay;
	}
	
	/**
	 * String형으로 요일을 반환
	 *
	 * @param Date형
	 *            날짜
	 * @return String형 "목"
	 */
	public static String getWeek(Date sourceDay) {
		return getWeek(toString(sourceDay, "yyyyMMdd"));
	}
	
	/**
	 * String형으로 요일을 반환
	 *
	 * @param 일자
	 *            "20040101"
	 * @return String형 "목"
	 */
	public static String getWeek(String srcDay) {
		String strWeekDay = null;
		String sourceDay = srcDay;
		
		if (sourceDay == null || sourceDay.length() < 8) {
			// return "";
			sourceDay = getFormatDateString("yyyyMMdd");
		}
		
		Calendar cal = getDate(sourceDay);
		
		switch (cal.get(Calendar.DAY_OF_WEEK)) {
			case 1:
				strWeekDay = "일";
				break;
			case 2:
				strWeekDay = "월";
				break;
			case 3:
				strWeekDay = "화";
				break;
			case 4:
				strWeekDay = "수";
				break;
			case 5:
				strWeekDay = "목";
				break;
			case 6:
				strWeekDay = "금";
				break;
			case 7:
				strWeekDay = "토";
				break;
			
			default:
				break;
		}
		
		return strWeekDay;
	}
	
	/**
	 * 날짜간격 int형으로 날짜의 차를 반환
	 *
	 * @param from
	 *            시작일 "20030808"
	 * @param to
	 *            종료일 "20030810"
	 * @return int형 숫자 2
	 */
	public static final int getIntDaysBetween(String from, String to) {
		
		String format = "yyyyMMdd";
		
		java.util.Date d1 = toDate(from, format);
		java.util.Date d2 = toDate(to, format);
		
		if (d1 == null || d2 == null) {
			return 0;
		}
		
		int duration = (int) ((d2.getTime() - d1.getTime()) / 1000 / 3600 / 24);
		return duration;
	}
	
	/**
	 * 날짜간격 double형으로 변환
	 *
	 * @param from
	 *            시작일
	 * @param to
	 *            종료일
	 * @return double형 숫자
	 */
	public static final double getDoubleDaysBetween(String from, String to) {
		
		String format = "yyyyMMddHHmmss";
		//java.text.SimpleDateFormat formatter = new java.text.SimpleDateFormat(format, java.util.Locale.KOREA);
		java.util.Date d1 = toDate(from, format);
		java.util.Date d2 = toDate(to, format);
		
		if (d1 == null || d2 == null) {
			return 0;
		}
		
		long duration = d2.getTime() - d1.getTime();
		
		// seconds in 1 day : 1000 milliseconds = 1 second
		return (double) (duration / (1000));
		
	}
	
	/**
	 * 입력받은 문자열을 Calendar 형으로 변환
	 *
	 * @param src
	 *            날짜형으로 바꿀 문자열
	 * @return Calendar형
	 */
	public static Calendar getDate(String src) {
		
		if (src == null || src.length() != 14) {
			return null;
		}
		
		try {
			int year = Integer.parseInt(src.substring(0, 4));
			int month = Integer.parseInt(src.substring(4, 6));
			int day = Integer.parseInt(src.substring(6, 8));
			int hour = 0;
			int min = 0;
			int sec = 0;
			if (src.length() > 8) {
				hour = Integer.parseInt(src.substring(8, 10));
				min = Integer.parseInt(src.substring(10, 12));
				sec = Integer.parseInt(src.substring(12, 14));
			}
			Calendar cal = Calendar.getInstance();
			cal.set(year, month - 1, day, hour, min, sec);
			return cal;
			
		} catch (Exception e) {
			LOGGER.debug("Exception: " + e.toString());
			// System.out.println("Date Type Parsing Error:" + e.getMessage());
			return null;
		}
	}
	
	public static String getDate(long millis, String pattern) {
		Calendar cal = Calendar.getInstance();
		cal.setTimeInMillis(millis);
		Date date = cal.getTime();
		return ComDateUtils.toString(date, pattern);
		
	}
	
	/**
	 * <pre>
	 * 날짜 연산 Method getCalDate.
	 * 
	 * Ex)
	 * getCalDate("20030310", 'Y', 1) ==> "20040310"
	 * getCalDate("20030310", 'M', -1) ==> "20030210"
	 * getCalDate("20030310", 'D', 30) ==> "20030409"
	 * </pre>
	 *
	 * @param String
	 *            sourceDay(기준일자)
	 * @param char charCalKind(연산구분)
	 * @param iValue
	 *            (더하거나 뺄 값)
	 * @return String
	 */
	public static String getCalDate(String sourceDay, char charCalKind, int iValue) {
		if (sourceDay == null || sourceDay.length() < 8) {
			return sourceDay;
		}
		
		Calendar cal = getDate(sourceDay);
		
		switch (charCalKind) {
			case 'Y':
			case 'y':
				cal.add(Calendar.YEAR, iValue);
				break;
			case 'M':
			case 'm':
				cal.add(Calendar.MONTH, iValue);
				break;
			case 'D':
			case 'd':
				cal.add(Calendar.DAY_OF_MONTH, iValue);
				break;
			
			default:
				break;
		}
		
		String year = Integer.toString(cal.get(Calendar.YEAR));
		String month = Integer.toString(cal.get(Calendar.MONTH) + 1);
		String date = Integer.toString(cal.get(Calendar.DAY_OF_MONTH));
		
		String returnDate = new StringBuffer(year).append(ComStringUtils.fixDateLength(month)).append(ComStringUtils.fixDateLength(date)).toString();
		
		return returnDate;
	}
	
	/**
	 * <pre>
	 * 년월일 또는 년월, 월을 넣으면 분기를 Return
	 * 
	 * Ex)
	 * 년월일 : getQuarter("20030310") ==> "1"
	 * 년월   : getQuarter("200305")   ==> "2"
	 * 월     : getQuarter("10")       ==> "4"
	 * </pre>
	 *
	 * @param String
	 *            source(기준일자)
	 * @return String
	 */
	public static String getQuarter(String src) {
		
		String source = src;
		
		if (source == null) {
			return "0";
		}
		
		switch (source.length()) {
			case 8:
			case 6:
				source = source.substring(4, 6);
				break;
			case 2:
				break;
			default:
				return "0";
		}
		return ComNumberUtils.divide(ComNumberUtils.add(source, "2"), "3", 0, ComNumberUtils.ROUND_DOWN);
	}
	
}
