package am.common.util.com;

public class util {
	public static String isNull(String str, String returnStr) {
		if (str == null || str.equals(""))
			return returnStr;
		else
			return str;
	}

	public static String Dbstr(String str) {
		str = str.replace("'", "''");
		return str;
	}

	public static String Webstr(String str) {
		str = str.replace("&", "&amp;");
		str = str.replace(" ", "&nbsp;");
		str = str.replace("\r\n", "<BR/>");
		str = str.replace("\t", "&nbsp;&nbsp;&nbsp;&nbsp;");
		return str;
	}
	public static String FindEncode(String s){
		String rlt = "";
		String[] arr = {"euc-kr","utf-8","iso-8859-1","ksc5601","x-windows-949"}; 
		try{ 
			for( int i =0 ; i < arr.length; i++){ 
				for(int z=0; z < arr.length ; z++){ 
					if( i != z) 
						rlt += arr[i]+"=>"+ arr[z]+ " \r\n ==> " +new String(s.getBytes(arr[i]),arr[z]); 
				} 
			} 
		}catch(Exception e){ 
			rlt = e.getMessage(); 
		}
		return rlt;
	}
}
