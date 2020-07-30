package am.common.util.encrypt;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class EgovMessageDigest {
	static MessageDigest m_oMD = null;

	static final char[] HEX = { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f' };

	static {
		try {
			m_oMD = MessageDigest.getInstance("MD5");
		} catch (NoSuchAlgorithmException localNoSuchAlgorithmException) {
		}
	}

	public static byte[] digest(String p_sInput) {
		m_oMD.reset();
		byte[] byteBuffer = p_sInput.getBytes();
		m_oMD.update(byteBuffer);
		byte[] byteDigest = m_oMD.digest();
		return byteDigest;
	}

	public static final String bytes2HexStr(byte[] p_byteBuffer) {
		int nLength = p_byteBuffer.length;
		StringBuffer oHexString = new StringBuffer(nLength * 2);
		for (int i = 0; i < nLength; i++) {
			int nHi = p_byteBuffer[i] >>> 4 & 0xF;
			oHexString.append(HEX[nHi]);
			int nLow = p_byteBuffer[i] & 0xF;
			oHexString.append(HEX[nLow]);
		}
		return oHexString.toString();
	}

	public static void main(String[] args) {
	}
}
