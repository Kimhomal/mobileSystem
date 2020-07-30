package am.common.util.com;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.text.NumberFormat;

public class ComNumberUtils {
	
	public final static int ROUND_CEILING = BigDecimal.ROUND_CEILING; // 가장 작은 수로 Round
	public final static int ROUND_DOWN = BigDecimal.ROUND_DOWN; // 버림
	public final static int ROUND_FLOOR = BigDecimal.ROUND_FLOOR; // 가장 큰 수로 Round
	public final static int ROUND_HALF_DOWN = BigDecimal.ROUND_HALF_DOWN; // 반내림
	public final static int ROUND_HALF_EVEN = BigDecimal.ROUND_HALF_EVEN; // 근접한 값으로 Round
	public final static int ROUND_HALF_UP = BigDecimal.ROUND_HALF_UP; // 반올림
	public final static int ROUND_UNNECESSARY = BigDecimal.ROUND_UNNECESSARY;
	public final static int ROUND_UP = BigDecimal.ROUND_UP; // 올림
	
	/**
	 * <pre>
	 * int 형의 데이터를 1000단위로 컴마가 있는 문자열로 변환
	 * </pre>
	 *
	 * @param int 숫자
	 * @return String 1000단위로 컴마가 있는 문자열
	 */
	public static String toString(int number) {
		
		NumberFormat formatter = NumberFormat.getInstance();
		
		return formatter.format(number);
	}
	
	/**
	 * <pre>
	 * long 형의 데이터를 1000단위로 컴마가 있는 문자열로 변환
	 * </pre>
	 *
	 * @param int 숫자
	 * @return String 1000단위로 컴마가 있는 문자열
	 */
	public static String toString(long number) {
		
		NumberFormat formatter = NumberFormat.getInstance();
		
		return formatter.format(number);
	}
	
	/**
	 * <pre>
	 * float 형의 데이터를 1000단위로 컴마가 있는 문자열로 변환
	 * </pre>
	 *
	 * @param int 숫자
	 * @return String 1000단위로 컴마가 있는 문자열
	 */
	public static String toString(float number) {
		
		NumberFormat formatter = NumberFormat.getInstance();
		
		return formatter.format(number);
	}
	
	/**
	 * <pre>
	 * double 형의 데이터를 1000단위로 컴마가 있는 문자열로 변환
	 * </pre>
	 *
	 * @param int 숫자
	 * @return String 1000단위로 컴마가 있는 문자열
	 */
	public static String toString(double number) {
		
		NumberFormat formatter = NumberFormat.getInstance();
		
		return formatter.format(number);
	}
	
	/**
	 * <pre>
	 * int 형의 데이터를 한글로 변환
	 * </pre>
	 *
	 * @param int 숫자
	 * @return String 한글로 변환된 문자열
	 */
	public static String toKorean(int number) {
		
		return toKorean((long) number);
	}
	
	/**
	 * <pre>
	 * long 형의 데이터를 한글로 변환
	 * </pre>
	 *
	 * @param long 숫자
	 * @return String 한글로 변환된 문자열
	 */
	public static String toKorean(long number) {
		
		boolean isOuterCiper = false;
		int ciper = 0;
		int inner = 0;
		int outer = 0;
		int index = 0;
		
		String koreanNumber = "";
		String[] digit = { "", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구" };
		String[] innerCiper = { "", "십", "백", "천" };
		String[] outerCiper = { "", "만", "억", "조", "경", "해" };
		
		ciper = getCiper(number);
		outer = (int) Math.floor((ciper - 1) / 4);
		inner = (int) (ciper - 1) % 4;
		
		for (int outerInx = outer; outerInx >= 0; outerInx--) {
			
			for (int innerInx = inner; innerInx >= 0; innerInx--, ciper--) {
				
				index = (int) ((number / Math.pow(10, ciper - 1)) % 10);
				
				if (index > 0) {
					
					koreanNumber = koreanNumber + digit[index] + innerCiper[innerInx];
					isOuterCiper = true;
					
				}
				
			}
			
			if (isOuterCiper) {
				
				koreanNumber = koreanNumber + outerCiper[outerInx];
				isOuterCiper = false;
				
			}
			
			inner = 3;
			
		}
		
		return koreanNumber;
		
	}
	
	/**
	 * <pre>
	 * 숫자의 자리수를 계산
	 * </pre>
	 *
	 * @param double 자리수를 구하고자 하는 숫자
	 * @return int 자리수
	 */
	private static int getCiper(double number) {
		
		int ciper = 0;
		
		if (number >= 1) {
			
			ciper = 1 + getCiper(number / 10);
			
		}
		
		return ciper;
		
	}
	
	/**
	 * <pre>
	 * A + B
	 * </pre>
	 *
	 * @param String
	 *            A
	 * @param String
	 *            B
	 * @return String A + B
	 *         (ex) NumberUtil.add( "11.11", "22.22" ) -> 33.33
	 */
	public static String add(String pValue1, String pValue2) {
		String value1 = pValue1;
		String value2 = pValue2;
		
		if (value1 == null || value1.equals("")) {
			value1 = "0";
		}
		if (value2 == null || value2.equals("")) {
			value2 = "0";
		}
		BigDecimal strValue1 = new BigDecimal(value1);
		BigDecimal strValue2 = new BigDecimal(value2);
		
		return strValue1.add(strValue2).toString();
	}
	
	/**
	 * <pre>
	 * A - B
	 * </pre>
	 *
	 * @param String
	 *            A
	 * @param String
	 *            B
	 * @return String A - B
	 *         (ex) NumberUtil.subtract("11.11", "22.11" ) -> -11.00
	 */
	public static String subtract(String pValue1, String pValue2) {
		String value1 = pValue1;
		String value2 = pValue2;
		
		if (value1 == null || value1.equals("")) {
			value1 = "0";
		}
		if (value2 == null || value2.equals("")) {
			value2 = "0";
		}
		BigDecimal strValue1 = new BigDecimal(value1);
		BigDecimal strValue2 = new BigDecimal(value2);
		
		return strValue1.subtract(strValue2).toString();
	}
	
	/**
	 * <pre>
	 * A * B
	 * </pre>
	 *
	 * @param String
	 *            A
	 * @param String
	 *            B
	 * @return String A * B
	 *         (ex) NumberUtil.multiply("11.111", "22.222" ) -> 246.908642
	 */
	public static String multiply(String pValue1, String pValue2) {
		String value1 = pValue1;
		String value2 = pValue2;
		
		if (value1 == null || value1.equals("")) {
			value1 = "0";
		}
		if (value2 == null || value2.equals("")) {
			value2 = "0";
		}
		BigDecimal strValue1 = new BigDecimal(value1);
		BigDecimal strValue2 = new BigDecimal(value2);
		
		return strValue1.multiply(strValue2).toString();
	}
	
	/**
	 * <pre>
	 * scaleRound(A * B)
	 * </pre>
	 *
	 * @param String
	 *            A
	 * @param String
	 *            B
	 * @param int scale : 소수점 이하 자리수
	 * @param int mode : ROUND_CEILING : 가장 작은 수로 Round
	 *        ROUND_DOWN : 버림
	 *        ROUND_FLOOR : 가장 큰 수로 Round
	 *        ROUND_HALF_DOWN : 반내림
	 *        ROUND_HALF_EVEN : 근접한 값으로 Round
	 *        ROUND_HALF_UP : 반올림
	 *        ROUND_UNNECESSARY :
	 *        ROUND_UP : 올림
	 * @return String A * B
	 *         (ex) NumberUtil.multiply("11.111", "22.222", 3, NumberUtil.ROUND_HALF_UP ) -> 246.909
	 */
	public static String multiply(String pValue1, String pValue2, int pScale, int pMode) throws ArithmeticException, IllegalArgumentException {
		String value1 = pValue1;
		String value2 = pValue2;
		int scale = pScale;
		int mode = pMode;
		
		if (value1 == null || value1.equals("")) {
			value1 = "0";
		}
		if (value2 == null || value2.equals("")) {
			value2 = "0";
		}
		BigDecimal strValue1 = new BigDecimal(value1);
		BigDecimal strValue2 = new BigDecimal(value2);
		
		return strValue1.multiply(strValue2).setScale(scale, mode).toString();
	}
	
	/**
	 * <pre>
	 * A / B
	 * </pre>
	 *
	 * @param String
	 *            A
	 * @param String
	 *            B
	 * @return String A / B
	 *         (ex) NumberUtil.divide("11.1", "22.2" ) -> 0.5
	 *         NumberUtil.divide("11.111", "22.111" ) -> 0.503
	 */
	public static String divide(String pValue1, String pValue2) {
		String value1 = pValue1;
		String value2 = pValue2;
		
		if (value1 == null || value1.equals("")) {
			value1 = "0";
		}
		if (value2 == null || value2.equals("")) {
			value2 = "0";
		}
		BigDecimal strValue1 = new BigDecimal(value1);
		BigDecimal strValue2 = new BigDecimal(value2);
		
		return strValue1.divide(strValue2, ROUND_HALF_UP).toString();
	}
	
	/**
	 * <pre>
	 * scaleRound(A / B)
	 * </pre>
	 *
	 * @param String
	 *            A
	 * @param String
	 *            B
	 * @param int scale : 소수점 이하 자리수
	 * @param int mode : ROUND_CEILING : 가장 작은 수로 Round
	 *        ROUND_DOWN : 버림
	 *        ROUND_FLOOR : 가장 큰 수로 Round
	 *        ROUND_HALF_DOWN : 반내림
	 *        ROUND_HALF_EVEN : 근접한 값으로 Round
	 *        ROUND_HALF_UP : 반올림
	 *        ROUND_UNNECESSARY :
	 *        ROUND_UP : 올림
	 * @return String A / B
	 *         (ex) NumberUtil.divide("11.111", "22.222", 3, NumberUtil.ROUND_HALF_UP ) -> 0.500
	 */
	public static String divide(String pValue1, String pValue2, int pScale, int pMode) throws ArithmeticException, IllegalArgumentException {
		String value1 = pValue1;
		String value2 = pValue2;
		int scale = pScale;
		int mode = pMode;
		
		if (value1 == null || value1.equals("")) {
			value1 = "0";
		}
		if (value2 == null || value2.equals("")) {
			value2 = "0";
		}
		BigDecimal strValue1 = new BigDecimal(value1);
		BigDecimal strValue2 = new BigDecimal(value2);
		
		return strValue1.divide(strValue2, scale, mode).toString();
	}
	
	/**
	 * <pre>
	 * A % B
	 * </pre>
	 *
	 * @param String
	 *            A(정수형)
	 * @param String
	 *            B(정수형)
	 * @return String A % B
	 *         (ex) NumberUtil.reminder("13", "4" ) -> 1
	 */
	public static String reminder(String pValue1, String pValue2) throws ArithmeticException, IllegalArgumentException {
		String value1 = pValue1;
		String value2 = pValue2;
			
			
		if (value1 == null || value1.equals("")) {
			value1 = "0";
		}
		if (value2 == null || value2.equals("")) {
			value2 = "0";
		}
		BigInteger strValue1 = new BigInteger(value1);
		BigInteger strValue2 = new BigInteger(value2);
		
		return strValue1.remainder(strValue2).toString();
	}
	
	/**
	 * <pre>
	 * abs(String)
	 * </pre>
	 *
	 * @param String
	 *            A
	 * @return abs( A )
	 *         (ex) NumberUtil.abs( "-123" ) -> 123
	 */
	public static String abs(String pValue) {
		String value = pValue;
		
		if (value == null || value.equals("")) {
			value = "0";
		}
		
		BigDecimal strValue = new BigDecimal(value);
		
		return strValue.abs().toString();
	}
	
	/**
	 * <pre>
	 * 숫자가 홀수인지 짝수인지 구분
	 * </pre>
	 *
	 * @param int A(정수형)
	 * @return int 숫자 (0이면 짝수, 1이면 홀수)
	 *         (ex) NumberUtil.getEven( 5 ) -> 1
	 */
	public static int getEven(int pNumber) {
		int number = pNumber;
		
		int even = 0;
		even = number % 2;
		
		return even;
	}
	
	/**
	 * <pre>
	 * 문자를 1000단위 콤마 소수점 2자리 표현
	 * </pre>
	 *
	 * @param String
	 *            문자
	 * @return String 문자
	 * 
	 */
	public static String getFommatt(String pNumber) {
		String number = pNumber;
		
		number = number.trim().replace(",", "");
		String result = "0.00";
		if (number != null && number.length() > 0 && Double.parseDouble(number) != 0) {
			java.text.DecimalFormat df = new java.text.DecimalFormat("#,###,###,###,###,###.00");
			result = df.format(Double.parseDouble(number));
		}
		return result;
	}
	
	/**
	 * <pre>
	 * 문자를 1000단위 콤마 표현
	 * </pre>
	 *
	 * @param String
	 *            문자
	 * @return String 문자
	 * 
	 */
	public static String getFommat(String pNumber) {
		String number = pNumber;
		
		if (-1 != number.lastIndexOf('.')) {
			number = number.substring(0, number.lastIndexOf('.'));
		}
		number = number.trim().replace(",", "");
		String result = "0";
		if (number != null && number.length() > 0 && Double.parseDouble(number) != 0) {
			java.text.DecimalFormat df = new java.text.DecimalFormat("#,###,###,###,###,###");
			result = df.format(Integer.parseInt(number));
		}
		return result;
	}
	
}
