package am.common.util.com;

import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.Properties;
import java.util.StringTokenizer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.StringUtils;

public class ComStringUtils {

	private static final Logger LOGGER = LoggerFactory.getLogger(ComStringUtils.class);


	/**
	 *
	 * @param dataList
	 * @return
	 */

	public static String[][] convertToArray(ArrayList<String> dataList) {
		if (dataList == null) return null;

		String[][] array = new String[dataList.size()][];
		for (int i = 0; i < dataList.size(); i++) {
			array[i] = dataList.get(i).split("//");
		}
		return array;
	}

	/**
	 *
	 * @param dataList
	 */
	@SuppressWarnings("unchecked")
	public static void sortArrayList(ArrayList dataList) {
		Collections.sort(dataList, new Comparator() {
			@Override
			public int compare(Object o1, Object o2) {
				return ((String) o1).compareTo((String) o2);
			}
		});
		Object[] o = dataList.toArray();
		Arrays.sort(o);
	}

	/**
	 *
	 * @param dataList
	 * @return
	 */
	public static String convertToSelectList(String[][] array) {
		if (array == null) return null;

		StringBuffer buf = new StringBuffer();

		for (int i = 0; i < array.length; i++) {
			buf.append("<option value='" + array[i][0] + "'>" + array[i][1] + "</option>");
		}
		return buf.toString();
	}

	public static String convertToSelectList(String[][] array, String selected) {
		if (array == null) return null;

		StringBuffer buf = new StringBuffer();

		for (int i = 0; i < array.length; i++) {
			String sel = selected.equals(array[i][0]) ? "selected" : "";
			buf.append("<option value='" + array[i][0] + "' " + sel + ">" + array[i][1] + "</option>");
		}
		return buf.toString();
	}

	public static String convertToSelectList(String[][] array, boolean isContain, String value) {
		if (array == null) return null;

		StringBuffer buf = new StringBuffer();

		for (int i = 0; i < array.length; i++) {
			if (isContain) {
				if (array[i][0].startsWith(value)) {
					buf.append("<option value='" + array[i][0] + "'>" + array[i][1] + "</option>");
				}
			} else {
				if (!array[i][0].startsWith(value)) {
					buf.append("<option value='" + array[i][0] + "'>" + array[i][1] + "</option>");
				}
			}

		}
		return buf.toString();
	}

	public static String convertToSelectList(String[][] array, boolean isContain, String value, String value2) {
		if (array == null) return null;

		StringBuffer buf = new StringBuffer();

		for (int i = 0; i < array.length; i++) {
			if (isContain) {
				if (array[i][0].startsWith(value) || array[i][0].startsWith(value2)) {
					buf.append("<option value='" + array[i][0] + "'>" + array[i][1] + "</option>");
				}
			} else {
				if (!array[i][0].startsWith(value) && !array[i][0].startsWith(value2)) {
					buf.append("<option value='" + array[i][0] + "'>" + array[i][1] + "</option>");
				}
			}

		}
		return buf.toString();
	}

	public static String convertToSelectList(String[][] array, boolean isContain, String value, String value2, String selected) {
		if (array == null) return null;

		StringBuffer buf = new StringBuffer();

		for (int i = 0; i < array.length; i++) {
			if (isContain) {
				if (array[i][0].startsWith(value) || array[i][0].startsWith(value2)) {
					String sel = selected.equals(array[i][0]) ? "selected" : "";
					buf.append("<option value='" + array[i][0] + "' " + sel + ">" + array[i][1] + "</option>");
				}
			} else {
				if (!array[i][0].startsWith(value) && !array[i][0].startsWith(value2)) {
					String sel = selected.equals(array[i][0]) ? "selected" : "";
					buf.append("<option value='" + array[i][0] + "' " + sel + ">" + array[i][1] + "</option>");
				}
			}

		}
		return buf.toString();
	}

	/**
	 *
	 * @param dataList
	 * @return
	 */
	public static String convertToSelectList(String[] array) {
		if (array == null) return null;

		StringBuffer buf = new StringBuffer();

		for (int i = 0; i < array.length; i++) {
			buf.append("<option value='" + array[i] + "'>" + array[i] + "</option>");
		}
		return buf.toString();
	}

	public static String nvl(String value, String defaultValue) {
		if (value == null || value.equals("")) {
			return defaultValue;
		}
		return value;
	}

	/**
	 * null and empty value to defaultValue
	 *
	 * @param value
	 * @param defaultValue
	 * @return
	 */
	public static String nvl2(String value, String defaultValue) {
		if (value == null || value.equals("")) {
			return defaultValue;
		}
		return convertNoEnter(value);
	}

	/**
	 * <pre>
	 * String Format 설정.
	 * source string을 정해진 길이 만큼 문자(char)로 채워넣는 함수.
	 * 오른쪽, 왼쪽을 선택한다.
	 * @param String 원래문자
	 * @param int 문자길이
	 * @param String 채울문자
	 * @param boolean 원래문자를 오른쪽으로 둘 경우 true, 왼쪽 둘 경우 false
	 * @return String
	 */
	public static String fixStrLength(String src, int len, String fillchar, boolean right) {
		String lstSrc = src;

		if (lstSrc == null) {
			lstSrc = "";
		}

		for (int i = lstSrc.getBytes().length; i < len; i++) {
			if (right) {
				lstSrc = fillchar + lstSrc;
			} else {
				lstSrc = lstSrc + fillchar;
			}
		}

		byte[] lBytes = lstSrc.getBytes();
		byte[] lNewStr = new byte[len];

		if (right) {
			for (int i = 0; i < len; i++) {
				lNewStr[i] = lBytes[i + (lBytes.length - len)];
			}
		} else {
			for (int i = 0; i < len; i++) {
				lNewStr[i] = lBytes[i];
			}
		}

		lstSrc = new String(lBytes);

		return lstSrc;
	}

	/**
	 * <pre>
	 * 날짜의 앞에 0을 채워 두자리로 만드는 함수
	 * @param String 원래문자
	 * @return String
	 */
	public static String fixDateLength(String src) {
		return fixStrLength(src, 2, "0", true);
	}

	/**
	 * <pre>
	 * String 형의 데이터를 1000단위로 컴마가 있는 문자열로 변환
	 * </pre>
	 *
	 * @param String
	 * @return String 1000단위로 컴마가 있는 문자열
	 */
	public static String toString(String number) {
		if (number == null || number.equals("")) {
			return "";
		} else {
			return ComNumberUtils.toString(Double.parseDouble(number));
		}
	}

	/**
	 * <pre>
	 * double 크기의 숫자를 세자리씩 콤마(,)를 찍어주고 소수점이하를 자리수만큼 0 으로 채우는 함수
	 * 10만 단위부터는 소수점 이하 10자리를 제대로 표현하지 못한다.
	 * @param String 원래문자
	 * @param iLength 소수점이하 자리수( 10 이상의 수가 들어오면 10으로 대치 )
	 * @return result 콤마로 분리된 문자열.
	 */
	public static String toDoubleFormat(String pStr, int pLen) {
		String str = pStr.trim();
		int iLength = pLen;

		String defaultPattern = "###,##0.0000000000";
		DecimalFormat df;

		if (str == null || str.length() == 0) {
			return "";
		}

		if (iLength > 10) {
			iLength = 10;
		}

		if (iLength == 0) {
			defaultPattern = "###,##0";
		} else {
			defaultPattern = defaultPattern.substring(0, defaultPattern.indexOf(".") + iLength + 1);
		}

		df = new DecimalFormat(defaultPattern);

		return df.format(Double.parseDouble(str));
	}

	/**
	 * <pre>
	 * 대상문자열(strTarget)에서 특정문자열(strSearch)을 찾아 지정문자열(strReplace)로
	 * 변경한 문자열을 반환한다.
	 * @param strTarget 대상문자열
	 * @param strSearch 변경대상의 특정문자열
	 * @param strReplace 변경 시키는 지정문자열
	 * @return 변경완료된 문자열
	 */
	public static String replace(String strTarget, String strSearch, String strReplace) {
		if (strTarget == null) return null;
		String strCheck = strTarget;
		StringBuffer strBuf = new StringBuffer();

		while (strCheck.length() != 0) {
			int begin = strCheck.indexOf(strSearch);

			if (begin == -1) {
				strBuf.append(strCheck);

				break;
			} else {
				int end = begin + strSearch.length();
				strBuf.append(strCheck.substring(0, begin));
				strBuf.append(strReplace);
				strCheck = strCheck.substring(end);
			}
		}

		return strBuf.toString();
	}

	/**
	 * <pre>
	 * 대상문자열(strTarget)에서 구분문자열(strDelim)을 기준으로 문자열을 분리하여
	 * 각 분리된 문자열을 배열에 할당하여 반환한다.
	 * @param strTarget 분리 대상 문자열
	 * @param strDelim 구분시킬 문자열로서 결과 문자열에는 포함되지 않는다.
	 * @param bContainNull 구분되어진 문자열중 공백문자열의 포함여부.
	 *                     true : 포함, false : 포함하지 않음.
	 * @return 분리된 문자열을 순서대로 배열에 격납하여 반환한다.
	 */
	public static String[] split(String strTarget, String strDelim, boolean bContainNull) {

		// StringTokenizer는 구분자가 연속으로 중첩되어 있을 경우 공백 문자열을 반환하지 않음.
		// 따라서 아래와 같이 작성함.
		int index = 0;
		String[] resultStrArray = null;

		resultStrArray = new String[search(strTarget, strDelim) + 1];
		String strCheck = strTarget;
		while (strCheck.length() != 0) {
			int begin = strCheck.indexOf(strDelim);
			if (begin == -1) {
				resultStrArray[index] = strCheck;
				break;
			} else {
				int end = begin + strDelim.length();
				if (bContainNull) {
					resultStrArray[index++] = strCheck.substring(0, begin);
				}
				strCheck = strCheck.substring(end);
				if (strCheck.length() == 0 && bContainNull) {
					resultStrArray[index] = strCheck;
					break;
				}
			}
		}
		return resultStrArray;
	}

	/**
	 * <pre>
	 * 대상문자열(strTarget)에서 지정문자열(strSearch)이 검색된 횟수를,
	 * 지정문자열이 없으면 0 을 반환한다.
	 * @param strTarget 대상문자열
	 * @param strSearch 검색할 문자열
	 * @return 지정문자열이 검색되었으면 검색된 횟수를, 검색되지 않았으면 0 을 반환한다.
	 */
	public static int search(String strTarget, String strSearch) {
		int result = 0;

		String strCheck = strTarget;
		for (int i = 0; i < strTarget.length();) {
			int loc = strCheck.indexOf(strSearch);
			if (loc == -1) {
				break;
			} else {
				result++;
				i = loc + strSearch.length();
				strCheck = strCheck.substring(i);
			}
		}
		return result;
	}

	/**
	 * <pre>
	 * 지정문자를 원하는 구분자로 변경해서 반환한다.
	 * @param partstr 대상문자열
	 * @return 지정문자열을 원하는 형태로 파싱한다. ( partstr은 대상문자열, len은 문자의 길이, partDelim은 구분자 )
	 */
	public static String getPartString(String partstr, int len, String partDelim) {
		String partstring = "";
		if (partstr == null || partstr.trim().equals("")) {
			partstring = "";
		} else if (partstr.trim().length() < len) {
			partstring = "";
		} else {
			if (len == 6 && partstr.length() >= 6) {
				partstring = new StringBuffer(partstr.substring(0, 1)).append(partDelim).append(partstr.substring(1, 6)).toString();
			} else if (len == 14 && partstr.length() >= 14) {
				partstring = new StringBuffer(partstr.substring(0, 6)).append(partDelim).append(partstr.substring(6, 14)).toString();
			} else if (len == 16 && partstr.length() >= 16) {
				partstring = new StringBuffer(partstr.substring(0, 6)).append(partDelim).append(partstr.substring(6, 8)).append(partDelim).append(partstr.substring(8, 14)).append(partDelim).append(partstr.substring(14, 16)).toString();
			}
		}
		return partstring;
	}

	/**
	 * <pre>
	 * 지정숫자의 배수가 맞는지 비교하여 참 거짓을 Return 한다.
	 * @param multiple 배수 숫자
	 * @param comparison 비교 숫자
	 * @return 비교문자가 배수문자의 배수 일 경우에 참(0), 아닐 경우에는 거짓(0 이외의 숫자)을 반환한다.
	 */
	public static int getMultipleNext(int multiple, int comparison) {

		int value = 0;
		value = comparison % multiple;
		return value;
	}

	/**
	 * <pre>
	 * 숫자에 원하는 형태의 마스크를 적용한 값을 리턴한다.
	 * @param multiple 배수 숫자
	 * @param comparison 비교 숫자
	 * @return 마스크가 적용된 값
	 */
	public static String getMaskValue(String value, String mask) {

		String maskValue = "";
		int j = 0;

		for (int i = 0; i < mask.length(); i++) {

			if (!mask.substring(i, i + 1).equals("-")) {

				try {
					maskValue += value.substring(j, j + 1);
					j = j + 1;
				} catch (Exception e) {
					LOGGER.debug("Exception: " + e.toString());
					maskValue = value;
				}

			} else {
				maskValue += "-";
			}
		}
		return maskValue;
	}

	/**
	 * <pre>
	 * i 가 숫자형 문자열이면 ','를 붙여줌
	 * DecimalFormat df=new DecimalFormat("###,###,###");이 적용됨
	 * @param i 배수 숫자
	 * @return 마스크가 적용된 값
	 */

	public static String toNumberString(String i) {
		java.text.DecimalFormat df = new java.text.DecimalFormat("###,###,###");
		String ret = "0";
		try {
			if (i.indexOf(",") > 0) {
				ret = i;
			} else {
				ret = df.format(Long.parseLong(i));
			}
		} catch (Exception e) {
			ret = "0";
		}
		return ret;
	}

	/**
	 * <pre>
	 * 입력받은 숫자만큼의 길이로 문자열을 잘라서 리턴함
	 * <p>
     * @param str    문자열
     * @param length 제한 길이
     * @return 제한 길이 이내의 문자열
	 */
	public static String cutString(String str, int length) {
		int len = str.length();
		return ((len <= length) ? str : str.substring(0, length));
	}

	public static final String LPad(String pSrc, String pFiller, int pSize) {
		String src = pSrc;
		String filler = pFiller;
		int size = pSize;

		StringBuffer sb = new StringBuffer();
		if (src == null) {
			src = "";
		}
		if (src.getBytes().length > size) {
			return src.substring(0, size);
		}
		for (int i = 0; i < size - src.length(); i++) {
			sb.append(filler);
		}

		String fillstr = substring(sb.toString(), 0, size - src.length());
		sb.append(src);
		return fillstr + src;
	}

	public static final String RPad(String pSrc, String pFiller, int pSize) {
		String src = pSrc;
		String filler = pFiller;
		int size = pSize;

		StringBuffer sb = new StringBuffer();
		if (src == null) {
			src = "";
		}
		if (src.getBytes().length > size) {
			return src.substring(0, size);
		}
		sb.append(src);
		for (int i = 0; i < size - src.length(); i++) {
			sb.append(filler);
		}

		return substring(sb.toString(), 0, size);
	}

	public static final String substring(String pStr, int pStartIdx, int pEndIdx) {
		String str = pStr;
		int startIndex = pStartIdx;
		int endIndex = pEndIdx;

		String returnString = "";
		if (str == null || "".equals(str) || startIndex < 0 || startIndex > endIndex) {
			return returnString;
		}
		int lastIndex = str.length();
		if (lastIndex < startIndex) {
			return returnString;
		}
		if (lastIndex + 1 < endIndex) {
			returnString = str.substring(startIndex, lastIndex);
		} else {
			returnString = str.substring(startIndex, endIndex);
		}
		return returnString;
	}

	// 문자열을 숫자 형식으로 변화 --유연호
	public static int str2int(String pStr) {
		String str = pStr;

		if (str == null || str.equals("")) {
			return 0;
		}
		Integer d = new Integer(str);
		return d.intValue();
	}

	// 주민번호의 뒷자리를 암호화형식으로 변환
	public static String regn_formmat(String pStr) {
		String str = pStr;

		if (str != null && str.length() > 13) {
			str = str.substring(0, 6) + "-*******";
		} else if (str != null && str.length() == 13) {
			str = str.substring(0, 6) + "-*******";
		}
		return str;
	}

	// 앞뒤 '' 삭제
	public static String stringRemove(String pStrIn, String pStrRemove) {
		String strIn = pStrIn;
		String strRemove = pStrRemove;

		StringTokenizer strToken = new StringTokenizer(strIn, strRemove, false);
		String strOut = "";
		while (strToken.hasMoreElements()) {
			strOut += strToken.nextElement();
		}
		if (strOut.length() == 0) {
			return "";
		} else {
			return strOut;
		}
	}

	/**
	 *
	 * 문자열에서 특수 문자를 찾아 Decimal값으로 변경하여 return 한다.
	 *
	 * @param strText
	 *
	 * @return String
	 *
	 */
	public static String convert(String pStrText) {
		String strText = pStrText;
		String strInput;
		StringBuffer strOutput = new StringBuffer("");
		String convert;
		char strTmp;
		int nCount;

		if (strText == null) {
			strText = "";
		}

		strInput = strText;
		nCount = strInput.length();

		for (int i = 0; i < nCount; i++) {

			strTmp = strInput.charAt(i);

			if (strTmp == '<') strOutput.append("&lt;");
			else if (strTmp == '>') strOutput.append("&gt;");
			else if (strTmp == '&') strOutput.append("&amp;");
			else if (strTmp == (char) 37) strOutput.append("&#37;");
			else if (strTmp == (char) 34) strOutput.append("&quot;");
			else if (strTmp == (char) 39) strOutput.append("&#39;");
			else if (strTmp == '#') strOutput.append("&#35;");
			else if (strTmp == '\n') strOutput.append("<br>");
			else strOutput.append(strTmp);

		}

		convert = strOutput.toString();
		return convert;

	}

	/**
	 *
	 * 문자열에서 특수 문자를 찾아 Decimal값으로 변경하여 return 한다.
	 *
	 * @param strText
	 *
	 * @return String
	 *
	 */
	public static String convertNoEnter(String pStrText) {
		String strText = pStrText;
		String strInput;
		StringBuffer strOutput = new StringBuffer("");
		String convert;
		char strTmp;
		int nCount;

		if (strText == null) {
			strText = "";
		}

		strInput = strText;
		nCount = strInput.length();

		for (int i = 0; i < nCount; i++) {

			strTmp = strInput.charAt(i);

			if (strTmp == '<') strOutput.append("&lt;");
			else if (strTmp == '>') strOutput.append("&gt;");
			else if (strTmp == '&') strOutput.append("&amp;");
			else if (strTmp == (char) 37) strOutput.append("&#37;");
			else if (strTmp == (char) 34) strOutput.append("&quot;");
			else if (strTmp == (char) 39) strOutput.append("&#39;");
			else if (strTmp == '#') strOutput.append("&#35;");
			else strOutput.append(strTmp);

		}

		convert = strOutput.toString();
		return convert;

	}

	public static String convertForView(String pStrText) {
		String strText = pStrText;
		String strInput;
		StringBuffer strOutput = new StringBuffer("");
		String convert;
		char strTmp;
		int nCount;

		if (strText == null) {
			strText = "";
		}

		strInput = strText;
		nCount = strInput.length();

		for (int i = 0; i < nCount; i++) {

			strTmp = strInput.charAt(i);

			if (strTmp == '<') strOutput.append("&lt;");
			else if (strTmp == '>') strOutput.append("&gt;");
			else if (strTmp == '&') strOutput.append("&amp;");
			else if (strTmp == (char) 37) strOutput.append("&#37;");
			else if (strTmp == (char) 34) strOutput.append("&quot;");
			else if (strTmp == (char) 39) strOutput.append("&#39;");
			else if (strTmp == '#') strOutput.append("&#35;");
			else if (strTmp == '\n') strOutput.append("<br>");
			else if (strTmp == ' ') strOutput.append("&nbsp;");
			else strOutput.append(strTmp);

		}

		convert = strOutput.toString();
		return convert;
	}

	public static String escapeForView(String pStrText) {
		String strText = pStrText;
		if (strText == null) strText = "";

		strText = strText.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("#", "&#35;").replaceAll("'", "&#39;").replaceAll("\"", "&quot;").replaceAll(" ", "&nbsp;").replaceAll("\\\\n", "<br/>");
		return strText;
	}

	/**
	 * 자바 스크립트 내에서 처리할 경우 < > 에 대한 처리
	 */
	public static String convertForScript(String strText) {
		if (strText == null || strText.length() == 0) {
			return "";
		}
		return escapHTML(convertForView(strText));
	}

	public static String escapHTML(String html) {
		if (html == null || html.length() == 0) {
			return "";
		}

		if ((html.indexOf('<') == -1) && (html.indexOf('>') == -1) && (html.indexOf('&') == -1) && (html.indexOf('\'') == -1)) {
			return html;
		}

		int len = html.length();
		StringBuffer sb = new StringBuffer(html.length());
		for (int i = 0; i < len; i++) {
			char c = html.charAt(i);
			if ('<' == c) {
				sb.append("&lt;");
			} else if ('>' == c) {
				sb.append("&gt;");
			} else if ('&' == c) {
				sb.append("&amp;");
			} else if ('\'' == c) {
				sb.append("&amp;&#35;39;");
			} else {
				sb.append(c);
			}
		}

		return sb.toString();
	}

	/**
	 * 한글문자열 인코딩 변환
	 *
	 * @param param
	 * @return
	 * @throws UnsupportedEncodingException
	 * @throws Exception
	 */
	public static String encodeHangul(String param) throws UnsupportedEncodingException {
		return new String(param.getBytes("8859_1"), "UTF-8");
	}

	public static String encodeHangul(String param, String charset) throws UnsupportedEncodingException  {
		return new String(param.getBytes("8859_1"), charset);
	}

	public static String encodeHangul2(String param, String charset) throws UnsupportedEncodingException  {
		return new String(param.getBytes("utf-8"), charset);
	}

	/**
	 * 파일업로드 파일확장자 가능여부
	 *
	 * @param param
	 * @return
	 * @throws Exception
	 */
	public static boolean isFileEx(String fileNm) {

		InputStream is = ComStringUtils.class.getResourceAsStream("/mail.properties"); // file.properties파일에서
																					// 변수값을 읽어들임
		Properties fileProps = new Properties();
		try {
			fileProps.load(is);
		} catch (Exception e) {
			// System.out.println("설정파일을 찾지 못했습니다.(/mail.properties)");
			return false;
		}
		String isfileEx = fileProps.getProperty("isfileEx");
		String ex[] = isfileEx.split(",");

		boolean rtValue = false;
		int fDot = fileNm.lastIndexOf('.');
		String fNm = fileNm.substring(0, fDot);
		String fEx = fileNm.substring(fDot, fileNm.length());

		for (int i = 0; i < ex.length; i++) {
			if (ex[i].equals(fEx.substring(1, fEx.length()))) {
				rtValue = true;
			}
		}

		return rtValue;
	}

	/**
	 * 숫자형으로 변환 가능한지 체크
	 * @param String
	 * @return boolean
	 * @throws Exception
	 */
	public static boolean isStringDouble(String s) {
		try {
			Double.parseDouble(s);
			return true;
		} catch (NumberFormatException e) {
			LOGGER.debug("Exception: " + e.toString());
			return false;
		}
	}

	public static boolean isPnum(String s) {
		try {
			Double pNum = Double.parseDouble(s);
			if(pNum >= 0.0){
				return true;
			}else{
				return false;
			}

		} catch (NumberFormatException e) {
			LOGGER.debug("Exception: " + e.toString());
			return false;
		}
	}

	public static boolean isPercentFormula(String s) {
		try {
			Double pNum = Double.parseDouble(s);
			if(pNum >= 0 && pNum <= 100){
				return true;
			}else{
				return false;
			}

		} catch (NumberFormatException e) {
			LOGGER.debug("Exception: " + e.toString());
			return false;
		}
	}

	public static String filterSystemPath(String pPath) {
		String path = pPath;
		path = StringUtils.cleanPath(path);
		//path = path.replaceAll("\\.\\.[/\\]", "");
		return path;
	}
	
	/**
	 * <p>
	 * String이 비었거나("") 혹은 null 인지 검증한다.
	 * </p>
	 *
	 * <pre>
	 *  StringUtil.isEmpty(null)      = true
	 *  StringUtil.isEmpty("")        = true
	 *  StringUtil.isEmpty(" ")       = false
	 *  StringUtil.isEmpty("bob")     = false
	 *  StringUtil.isEmpty("  bob  ") = false
	 * </pre>
	 *
	 * @param str - 체크 대상 스트링오브젝트이며 null을 허용함
	 * @return <code>true</code> - 입력받은 String 이 빈 문자열 또는 null인 경우
	 */
	public static boolean isEmpty(String str) {
		return str == null || str.length() == 0;
	}
}
