package am.common.util.com;

import egovframework.com.cmm.service.EgovProperties;
import egovframework.rte.psl.dataaccess.util.EgovMap;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.compress.archivers.zip.ZipArchiveEntry;
import org.apache.commons.compress.archivers.zip.ZipArchiveOutputStream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.net.URL;
import java.nio.charset.Charset;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.Map.Entry;

/**
 * 파일 관리를 위한 유틸
 *
 * @author khb
 * @since 2016.03.25
 * @version 1.0
 * @see <pre>
 *  == 개정이력(Modification Information) ==
 *
 *          수정일          수정자           수정내용
 *  ----------------    ------------    ---------------------------
 *         2016.05.03        khb          최초 생성
 *
 * </pre>
 */
public class FileUtil {

	private static final Logger LOGGER = LoggerFactory.getLogger(FileUtil.class);

	private final static String UPLOAD_PATH = EgovProperties.getProperty("Globals.fileStorePath");

	/**
	 * 파일 확장자 반환
	 *
	 * @param fileName
	 * @return
	 */
	public static String getFileExtension(String fileName) {
		return fileName.substring(fileName.lastIndexOf(".") + 1);
	}

	/**
	 * 임시 파일 생성
	 *
	 * @param path
//	 * @param ext
	 * @return
	 */
	public static File makeTempFile(String path) {
		File dir = new File(ComStringUtils.filterSystemPath(path));
		if (!dir.exists()) {
			dir.setExecutable(false, true);
			dir.setReadable(true);
			dir.setWritable(true);
			dir.mkdirs();
		}
		return dir;
	}

	/**
	 * 파일 객체로 디렉토리 삭제
	 *
	 * @param dir
	 * @return
	 */
	public static boolean rmDir(File dir) {
		boolean state = true;
		try {
			if (!dir.exists()) {
				return false;
			}
			File[] files = dir.listFiles();
			if (files != null) {
				for (File file : files) {
					if (file.isDirectory()) {
						rmDir(file);
					} else {
						file.delete();
					}
				}
				dir.delete();
			}
		} catch (Exception e) {
			state = false;
		}
		return state;
	}

	/**
	 * 디렉토리 명으로 디렉토리 삭제
	 *
	 * @param dirName
	 * @return
	 */
	public static boolean rmDir(String dirName) {
		boolean state = true;
		try {
			File dir = new File(ComStringUtils.filterSystemPath(dirName));
			return rmDir(dir);
		} catch (Exception e) {
			state = false;
		}
		return state;
	}

	/**
	 * 파일 삭제
	 *
	 * @param fileName
	 * @return
	 */
	public static boolean rmFile(String fileName) {
		boolean state = true;
		try {
			File file = new File(ComStringUtils.filterSystemPath(fileName));
			file.delete();
		} catch (Exception e) {
			state = false;
		}
		return state;
	}

	/**
	 * 디렉토리 생성
	 *
	 * @param dirName
	 * @return
	 */
	public static boolean mkDir(String dirName) {
		boolean state = true;
		try {
			File dir = new File(ComStringUtils.filterSystemPath(dirName));
			if (!dir.exists()) {
				dir.setExecutable(false, true);
				dir.setReadable(true);
				dir.setWritable(true);
				state = dir.mkdirs();
			} else {
				state = false;
			}
		} catch (Exception e) {
			state = false;
		}
		return state;
	}

	/**
	 * 파일 업로드
	 *
	 * @param saveFileName
	 * @param storePath
	 * @return
	 */
	 public static String writeFileSave(Entry<String, MultipartFile> fileEntry, String saveFileName, String storePath) throws IllegalStateException, IOException {

	 String storePathString = "";

	 if ("".equals(storePath) || storePath == null) {
	 storePathString = UPLOAD_PATH;
	 } else {
	 storePathString = storePath;
	 }

	 mkDir(storePath); // 디렉토리 생성

	 String filePath = "";

	 MultipartFile file = fileEntry.getValue();

	 String orginFileName = file.getOriginalFilename();

//	 String fileExt = getFileExtension(orginFileName);

	 String newName = saveFileName;

	 if (!"".equals(orginFileName)) {
	 filePath = ComStringUtils.filterSystemPath(storePathString + "/" + newName);
	 file.transferTo(new File(filePath));
	 }

	 return filePath;
	 }

	public static void setImage(String filePath, String fileNam, HttpServletResponse response) throws IOException {
		File file = null;
		FileInputStream fis = null;

		BufferedInputStream in = null;
		ByteArrayOutputStream bStream = null;

		String type = "";

		try {

			file = new File(ComStringUtils.filterSystemPath(filePath));
			System.out.println("file : " + file);
			fis = new FileInputStream(file);

			in = new BufferedInputStream(fis);
			bStream = new ByteArrayOutputStream();

			int imgByte;
			while ((imgByte = in.read()) != -1) {
				bStream.write(imgByte);
			}

			if (fileNam != null && !"".equals(fileNam)) {

				String ext = FileUtil.getFileExtension(fileNam);
				System.out.println("Ext : " +ext);
				type = "image/" + ext.toLowerCase();
				System.out.println("type : " + type);

			}
			response.setHeader("Content-Type", type);
			response.setContentLength(bStream.size());
			bStream.writeTo(response.getOutputStream());
			response.getOutputStream().flush();
			response.getOutputStream().close();

		} finally {
			if (bStream != null) {
				try {
					bStream.close();
				} catch (Exception ignore) {
					LOGGER.debug("IGNORE: {}", ignore.getMessage());
				}
			}
			if (in != null) {
				try {
					in.close();
				} catch (Exception ignore) {
					LOGGER.debug("IGNORE: {}", ignore.getMessage());
				}
			}
			if (fis != null) {
				try {
					fis.close();
				} catch (Exception ignore) {
					LOGGER.debug("IGNORE: {}", ignore.getMessage());
				}
			}
		}

	}

	/**
	 * @param filePath
	 * @param fileNam
	 * @param response
	 * @throws IOException
	 */
	public static void fileDown(String filePath, String fileNam, HttpServletResponse response) throws IOException {

		File file = new File(ComStringUtils.filterSystemPath(filePath + "/" + fileNam));

		BufferedInputStream bis = new BufferedInputStream(new FileInputStream(file));
		BufferedOutputStream bos = new BufferedOutputStream(response.getOutputStream());
		byte[] inputData = null;
		try {
			int read = 0;
			int bufSize = 2048;
			inputData = new byte[bufSize];
			while ((read = bis.read(inputData)) > 0) {
				bos.write(inputData, 0, read);
			}
			bos.flush();

		} catch (Exception e) {
			LOGGER.debug("Exception", e.getMessage());

		} finally {
			bis.close();
			bos.close();
		}
	}

	/**
	 * 서버 파일 업로드
	 *
	 * @param files
	 * @param KeyStr
	 *            파일명 시작 String
	 * @param storePath
	 *            디렉토리(폴더)
	 * @param gbn
	 *            : default="" 파일명 비교값(""->없으면 전부 업로드)
	 * @return 기존 파일 이름 / 새로운 파일 이름(날짜) / 파일경로를 List형태로 return
	 * @throws Exception
	 */
	public static List<Map<String, Object>> parseFileInfList(Map<String, MultipartFile> files, String KeyStr, String storePath, String gbn) throws Exception {

		SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyyMMddhhmmssSSS", Locale.KOREA);

		String storePathString = "";

		if (("".equals(storePath)) || (storePath == null)) {
			storePathString = UPLOAD_PATH;
		} else {
			storePathString = UPLOAD_PATH + storePath + "/";
		}

		File saveFolder = new File(storePathString);

		if ((!saveFolder.exists()) || (saveFolder.isFile())) {
			saveFolder.mkdirs();
		}

		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		Map<String, Object> map = null;
		String originalName = null;
		String newFilename = null;
		String filePath = null;

		if (!files.isEmpty()) {
			Iterator<Entry<String, MultipartFile>> itr = files.entrySet().iterator();

			MultipartFile multipartFile = null;

			int fileSeq = 0;

			while (itr.hasNext()) {
				Entry<String, MultipartFile> entry = itr.next();

				multipartFile = entry.getValue();

				if (multipartFile.getName().contains(gbn) || "".equals(gbn)) {
					if (!multipartFile.isEmpty()) {
						originalName = multipartFile.getOriginalFilename();
						newFilename = simpleDateFormat.format(Long.valueOf(new Timestamp(System.currentTimeMillis()).getTime()));
						newFilename = KeyStr + newFilename + fileSeq++;
						filePath = storePathString + newFilename;

						map = new HashMap<String, Object>();
						map.put("originalName", originalName);
						map.put("fileName", newFilename);
						map.put("filePath", storePathString);
						list.add(map);

						try {
							multipartFile.transferTo(new File(filePath));
						} catch (Exception e) {
							e.printStackTrace();
							LOGGER.debug(e.toString());

							if (list.size() != 0) {
								for (int i = 0; i < list.size(); i++) {
									map = list.get(i);
									newFilename = (String) map.get("fileName");

									if (!"".equals(newFilename)) {
										filePath = storePath + newFilename;
										rmFile(filePath);
									}
								}
							}
						}
					}
				}
			}
		}

		return list;
	}

	/**
	 * @param files
	 * @param KeyStr
	 * @param storePath
	 * @return
	 * @throws Exception
	 */
	public static List<Map<String, Object>> parseFileInfList(Map<String, MultipartFile> files, String KeyStr, String storePath) throws Exception {
		return parseFileInfList(files, KeyStr, storePath, "");
	}

	/**
	 * 파일 업로드(개별)
	 *
	 * @param multipartFile
	 * @param KeyStr
	 * @param storePath
//	 * @param gbn
	 * @return
	 * @throws Exception
	 */
	public static Map<String, Object> parseFileInf(MultipartFile multipartFile, String KeyStr, String storePath, int fileSeq) throws Exception {

		SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyyMMddhhmmssSSS", Locale.KOREA);

		String storePathString = "";

		if (("".equals(storePath)) || (storePath == null)) {
			storePathString = UPLOAD_PATH;
		} else {
			storePathString = UPLOAD_PATH + storePath + "/";
		}

		File saveFolder = new File(storePathString);

		if ((!saveFolder.exists()) || (saveFolder.isFile())) {
			saveFolder.mkdirs();
		}

		Map<String, Object> map = null;
		String originalName = null;
		String newFilename = null;
		String filePath = null;

		if (!multipartFile.isEmpty()) {
			originalName = multipartFile.getOriginalFilename();
			newFilename = simpleDateFormat.format(Long.valueOf(new Timestamp(System.currentTimeMillis()).getTime()));
			newFilename = KeyStr + newFilename + fileSeq;
			filePath = storePathString + newFilename;

			map = new HashMap<String, Object>();
			map.put("originalName", originalName);
			map.put("fileName", newFilename);
			map.put("filePath", storePathString);

			try {
				multipartFile.transferTo(new File(filePath));
			} catch (Exception e) {
				e.printStackTrace();
				LOGGER.debug(e.toString());

				newFilename = (String) map.get("fileName");

				if (!"".equals(newFilename)) {
					filePath = storePath + newFilename;
					rmFile(filePath);
				}
			}
		}

		return map;
	}

	// 리스트로 파일을 받아 zip로 압축 new
	public static void zip(List<File> src,String destPath) throws IOException 
	{
		BufferedInputStream bis = null;
		ZipArchiveOutputStream zos = null;
		OutputStream os = null;
		
		try
		{
			os = new FileOutputStream(new File(destPath));
			zos = new ZipArchiveOutputStream(os);
			zos.setEncoding(Charset.defaultCharset().name());

			int length;
			ZipArchiveEntry ze;
			byte[] buf = new byte[4 * 1024];

			if (src.size() > 0) {

				for (int i = 0; i < src.size(); i++) {
					System.out.println("name: " + src.get(i).getName());
					ze = new ZipArchiveEntry(src.get(i).getName());
					zos.putArchiveEntry(ze);
					bis = new BufferedInputStream( new FileInputStream(src.get(i)) );
					while ((length = bis.read(buf, 0, buf.length)) >= 0) {
						zos.write(buf, 0, length);
						zos.flush();
					}
				}
			}
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
		finally
		{
			bis.close();
			zos.closeArchiveEntry();
			zos.close();
			os.close();
		}
	}
	
	/**
	 * Base64 형태로 이미지 파일 다운로드
	 *
	 * @param List<?> files
	 * @return HashMap<String, Object>
	 * @author hochul
	 */
	public static String toBase64(EgovMap param) throws IOException {
		String base64 = null;
		
    	HashMap<String, Object> list = new HashMap<String, Object>();
    	String fileFullName = (String) param.get("fileNm");
    	
    	String fileName = null;
    	if(fileFullName.lastIndexOf(".") == -1) {
    		fileName = fileFullName;
    	} else {
    		fileName = fileFullName.substring(0, fileFullName.lastIndexOf("."));
    	}
    	
    	String fileExtName = fileFullName.substring(fileFullName.lastIndexOf(".") + 1);
    	if(fileExtName == "") {
    		fileExtName = "jpeg";
    	}
    	
    	String filePath = (String) param.get("filePath");
    	
    	FileInputStream inputStream = null;
    	ByteArrayOutputStream byteOutStream = null;
		byte[] inputData = null;
		
		try {
			File file = new File(ComStringUtils.filterSystemPath(filePath));
			
			if(file.exists()) {
				inputStream = new FileInputStream(file);
				byteOutStream = new ByteArrayOutputStream();
				
				int read = 0;
    			int bufSize = 2048;
    			
    			inputData = new byte[bufSize];
    			while ((read = inputStream.read(inputData)) > 0) {
    				byteOutStream.write(inputData, 0, read);
    			}
    			
    			byte[] fileArray = byteOutStream.toByteArray();
    			String changeString = "data:image/" + fileExtName + ";base64, " + new String(Base64.encodeBase64String(fileArray));
    			
    			list.put("data", changeString);
    			list.put("name", fileName);
    			list.put("type", fileExtName);
    			
    			base64 = changeString;
			}
		} catch (Exception e) {
			LOGGER.debug("Exception", e.getMessage());
		} finally {
			if(inputStream != null) {
				inputStream.close();
			}
			
			if(byteOutStream != null) {
				byteOutStream.close();
			}
		}
        
        return base64;
	}
}
