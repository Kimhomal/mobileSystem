package am.common.util.encrypt;

public class PasswordEncrypt {
	public static final String SECURITYKEY = "securityKeyNS";

	public static String cryptPassword(String passwd) {
		String reply = "";

		if (passwd == null)
			passwd = "";
		else
			passwd = passwd.trim();
		try {
			String getPasswd = passwd;
			getPasswd = EgovMessageDigest.bytes2HexStr(EgovMessageDigest.digest(getPasswd));
			reply = getPasswd;
		} catch (Exception ex) {
			reply = null;
		}
		if (reply == null)
			reply = passwd;

		return reply;
	}
}
