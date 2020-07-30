package am.main;

import am.common.annotation.AuthExclude;
import am.common.web.service.StdCodeService;
import am.main.service.MainPageService;
import am.main.service.impl.AuthVO;
import egovframework.com.cmm.service.EgovProperties;
import egovframework.rte.psl.dataaccess.util.EgovMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.annotation.Resource;
import javax.imageio.ImageIO;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.xml.bind.DatatypeConverter;
import java.awt.image.BufferedImage;
import java.io.*;
import java.util.HashMap;
import java.util.List;

/**
 * 메인 페이지 컨트롤러 클래스
 *
 * @author SNC
 * @version 1.0
 * @see <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2018.07.25  SNC           최초 생성
 *
 * </pre>
 * @since 2018.07.25
 */
@Controller
public class MainPageController {
    private static final Logger logger = LoggerFactory.getLogger(MainPageController.class);

    @Resource(name = "mainPageService")
    private MainPageService mainPageService;

    @Resource(name = "stdCodeService")
    private StdCodeService stdCodeService;

    // @AuthExclude
//	@RequestMapping(value = "/index.do")
//	public String indexPage(HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
//
//		return "index";
//	}

    // 로그인 전 메인페이지
    @AuthExclude
    @RequestMapping(value = "/mainPage.do")
    public String mainPage(AuthVO vo, HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
        return "mainPage";
    }

    // 로그인 전 validation checking
    @AuthExclude
    @RequestMapping(value = "/main/loginChecking.json", method = RequestMethod.POST, produces = {MediaType.APPLICATION_JSON_VALUE})
    public ModelMap loginChecking(AuthVO vo, ModelMap model, HttpServletRequest request) throws Exception {
        vo.setSearchIpAddr(this.getClientIpAddr(request));
        EgovMap rtnMap = this.mainPageService.loginChecking(vo);
        return model.addAttribute("jsonView", rtnMap);
    }

    // 로그인 수행 (세션 생성)
    @AuthExclude
    @RequestMapping(value = "/main/login.do")
    public String login(AuthVO vo, ModelMap model, HttpServletRequest request) throws Exception {
        EgovMap resEgovMap = this.mainPageService.selectUserInfo(vo);
        String rootPath = request.getContextPath();
        String returnURL = "redirect:" + rootPath + "/";

        try {
            if (resEgovMap != null && resEgovMap.size() > 0) {
                AuthVO authVO = new AuthVO();
                String gradeTmp = null;

                authVO.setUserId((String) resEgovMap.get("userId"));
                authVO.setUserNm((String) resEgovMap.get("userNm"));
                authVO.setTelNo((String) resEgovMap.get("telNo"));
                authVO.setUserPrivil((String) resEgovMap.get("userPrivil"));
                authVO.setIpAddr((String) resEgovMap.get("ipAddr"));
                authVO.setMailAddr((String) resEgovMap.get("mailAddr"));
                authVO.setUserOrgan((String) resEgovMap.get("userOrgan"));
                authVO.setOrganNm((String) resEgovMap.get("organNm"));
                authVO.setUserDpt((String) resEgovMap.get("userDpt"));
                authVO.setDptNm((String) resEgovMap.get("dptNm"));
                authVO.setOrganCd((String) resEgovMap.get("organCd"));
                authVO.setGradeArrayCnt(Integer.parseInt((String) resEgovMap.get("gradeArrayCnt")));

                if (authVO.getGradeArrayCnt() != 0) {
                    if (resEgovMap.get("gradeArr1") != null) {
                        gradeTmp = "'" + (String) resEgovMap.get("gradeArr1") + "'";
                    }
                    if (resEgovMap.get("gradeArr2") != null) {
                        gradeTmp = gradeTmp + "," + "'" + (String) resEgovMap.get("gradeArr2") + "'";
                    }
                    if (resEgovMap.get("gradeArr3") != null) {
                        gradeTmp = gradeTmp + "," + "'" + (String) resEgovMap.get("gradeArr3") + "'";
                    }
                    authVO.setGrade(gradeTmp);
                } else {
                    authVO.setGrade(gradeTmp);
                }

                logger.debug("============ 세션 생성 =============");
                logger.debug("userId : {}", authVO.getUserId());
                logger.debug("userNm : {}", authVO.getUserNm());
                logger.debug("organCd : {}", authVO.getOrganCd());
                logger.debug("organNm : {}", authVO.getOrganNm());
                logger.debug("gradeArrayCnt : {}", authVO.getGradeArrayCnt());
                logger.debug("grade : {}", authVO.getGrade());


                HttpSession session = request.getSession();
                session.setAttribute("authInfo", authVO);

                session.setMaxInactiveInterval(60 * 120);    // 2시간
                returnURL = "redirect:/main/mainPageView.do";
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }

        return returnURL;
    }

    // 로그인 후 메인페이지
    @RequestMapping(value = "/main/mainPageView.do")
    public String mainPageView(AuthVO vo, HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
        return "mainPage";
    }

    // 로그아웃
    @RequestMapping(value = "/main/logout.do")
    public String logout(HttpServletRequest request, HttpServletResponse response) throws Exception {
        String ctxPath = request.getContextPath();
        String returnURL = "redirect:" + ctxPath + "/";
//		String returnURL = "redirect:" + "/";

        request.getSession().removeAttribute("authInfo");
        request.getSession().invalidate();

        return returnURL;
    }

    // 회원가입 팝업화면 호출
    @AuthExclude
    @RequestMapping(value = "/main/memberRegisterView.do")
    public String memberRegisterView(ModelMap modelMap) throws Exception {
        // 조직코드
        List<?> organList = this.stdCodeService.selectStdCodeList("ORGAN");
        // 부서코드
        List<?> dptList = this.stdCodeService.selectStdCodeList(((EgovMap) organList.get(0)).get("stdCode").toString());
        modelMap.addAttribute("organList", organList);
        modelMap.addAttribute("dptList", dptList);

        HttpServletRequest req = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
        String clientIP = req.getHeader("X-FORWARDED-FOR");
        if (clientIP == null) {
            clientIP = req.getRemoteAddr();
        }
        modelMap.addAttribute("clientIP", clientIP);

        return "main/memberRegister";
    }

    // 회원가입
    @AuthExclude
    @RequestMapping(value = "/main/insertUserInfo.do")
    public String insertUserInfo(AuthVO vo, ModelMap modelMap, HttpServletRequest req) throws Exception {
        vo.setInsUser(vo.getUserId());
        vo.setUptUser(vo.getUserId());
        this.mainPageService.insertUserInfo(vo);

        modelMap.addAttribute("msg", "가입이 완료되었습니다. 관리자에게 승인요청을 하십시오.");

        return "json2View";
    }

    // 회원정보 팝업화면 호출
    @RequestMapping(value = "/main/selectMemberRegister.do")
    public String selectMemberRegister(ModelMap modelMap, HttpServletRequest request) throws Exception {
        // 세션객체
        AuthVO authInfo = (AuthVO) request.getSession().getAttribute("authInfo");
        authInfo.setSearchUserId(authInfo.getUserId());
        // 사용자 정보 조회
        EgovMap rtnInfo = this.mainPageService.selectUserInfo(authInfo);
        // 조직코드
        List<?> organList = this.stdCodeService.selectStdCodeList("ORGAN");
        // 부서코드
        List<?> dptList = this.stdCodeService.selectStdCodeList(((EgovMap) organList.get(0)).get("stdCode").toString());

        modelMap.addAttribute("rtnInfo", rtnInfo);
        modelMap.addAttribute("organList", organList);
        modelMap.addAttribute("dptList", dptList);

        return "main/memberRegister";
    }

    // 회원정보수정
    @RequestMapping(value = "/main/updateUserInfo.do")
    public String updateUserInfo(AuthVO vo, ModelMap modelMap, HttpServletRequest request) throws Exception {
        this.mainPageService.updateUserInfo(vo);

        modelMap.addAttribute("msg", "회원정보가 수정되었습니다.");

        return "json2View";
    }

    // 아이디 중복확인
    @AuthExclude
    @RequestMapping(value = "/main/uniqueUserIdCheck.do")
    public String uniqueUserIdCheck(AuthVO vo, ModelMap modelMap, HttpServletRequest request) throws Exception {
        EgovMap rtnMap = this.mainPageService.uniqueUserIdCheck(vo);
        modelMap.addAttribute("rtnMap", rtnMap);

        return "json2View";
    }

    // 시스템 접근로그
    @RequestMapping(value = "/main/insertConnectStat.do")
    public String insertConnectStat(@RequestParam(value = "mnuCd", required = true) String mnuCd, HttpServletRequest request) throws Exception {
        // 세션객체
        AuthVO authInfo = (AuthVO) request.getSession().getAttribute("authInfo");
        String userId = authInfo.getUserId();
        String ipAddr = this.getClientIpAddr(request);

        this.mainPageService.insertConnectStat(mnuCd, userId, ipAddr);
        return "json2View";
    }

    // IP 추출
    public String getClientIpAddr(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");

        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }

        return ip;
    }

    /**
     * 항공사진 판독시스템 (cs프로그램)에서 요청 하는 경우임.
     * 항공사진 판독시스템 > 사진 업로드 ( 클라이언트 파일을 서버에 저장: 판독사의 판독결과 이미지)
     *
     * @param params
     * @param model
     * @return
     * @throws Exception
     */
    @AuthExclude
    @RequestMapping(value = "/base64/imgUpload.do", method = RequestMethod.POST)
    public void imgUpload(@RequestParam HashMap<String, Object> params, ModelMap model, HttpServletRequest request) throws Exception {
        String fileName = params.get("Name").toString();
        String data = params.get("Data").toString();

        //base64로 받은 data를 base64Decoder() 에서 서버 경로로 저장
        base64Decoder(data, fileName);
    }

    public boolean base64Decoder(String base64, String target) {
        //base64 -> byte -> file 로 변환
        byte[] imageBytes = DatatypeConverter.parseBase64Binary(base64);

        try {
            BufferedImage bufImg = ImageIO.read(new ByteArrayInputStream(imageBytes));
            ImageIO.write(bufImg, "png", new File(EgovProperties.getProperty("Globals.fileStorePath") + "/result_img/" + target + ".png"));
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }
        return true;
    }

    /**
     * 항공사진 판독시스템 (cs프로그램)에서 요청 하는 경우임.
     * 항공사진 판독시스템 > 로그인 (로그인 된 유저 정보를 txt파일에 저장)
     *
     * @param params
     * @param model
     * @return
     * @throws Exception
     */
    @RequestMapping(value = "/main/makeLoginUserInfo", method = RequestMethod.POST, produces = {MediaType.APPLICATION_JSON_VALUE})
    public ModelMap makeLoginUserInfo(ModelMap model, HttpServletRequest request) throws Exception {
//		String userNm = request.getAttribute("userNm").toString();
        BufferedWriter output = null;
        try {
            File file = new File(EgovProperties.getProperty("Globals.fileStorePath") + "/LOGIN_MNG/userInfo.txt");
            output = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(file), "UTF8"));
            AuthVO auth = (AuthVO) request.getSession().getAttribute("authInfo");

            output.write(auth.getUserId());
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            HashMap<String, Object> jsonMap = new HashMap<String, Object>();
            if (output != null) {
                jsonMap.put("root", true);
                output.close();
            } else {
                jsonMap.put("root", false);
            }
            model.addAttribute("jsonView", jsonMap);
        }

        return model;
    }

    /**
     * 항공사진 판독시스템 (cs프로그램)에서 요청 하는 경우임.
     * 항공사진 판독시스템 > 로그인 (로그인 된 유저 정보를 저장한 txt파일에서 유저 이름읽어와서 반환)
     *
     * @param params
     * @param model
     * @return
     * @throws Exception
     */
    @AuthExclude
    @RequestMapping(value = "/main/loginUserInfo", method = RequestMethod.POST, produces = {MediaType.APPLICATION_JSON_VALUE})
    public ModelMap loginUserInfo(ModelMap model, HttpServletRequest request) throws Exception {
//		EgovMap rtnInfo = this.mainPageService.selectUserInfoByIp(request.getRemoteAddr());
        HashMap<String, Object> jsonMap = new HashMap<String, Object>();
//		
        try {
//			jsonMap.put("userName", rtnInfo.get("userNm")); // 로그인 유저 이름
            File file = new File(EgovProperties.getProperty("Globals.fileStorePath") + "/LOGIN_MNG/userInfo.txt");
            BufferedReader br = new BufferedReader(new InputStreamReader(new FileInputStream(file), "UTF8"));

            String userId;

            while ((userId = br.readLine()) != null) {
                jsonMap.put("userName", userId); // 로그인 유저 이름
//				jsonMap.put("userPrivil", "PRI01");
//				System.out.println("userName : " + userId);
            }
            br.close();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }

//		jsonMap.put("userPrivil", rtnInfo.get("userPrivil")); // 로그인 유저 이름

        model.addAttribute("jsonView", jsonMap);
//		System.out.println("로그인 유저 정보 요청 끝");
        return model;
    }

    /**
     * 항공사진 판독시스템 (cs프로그램)에서 요청 하는 경우임.
     * 항공사진 판독시스템 > 로그인 (로그인 된 유저 정보를 저장한 txt파일 삭제)
     *
     * @param params
     * @param model
     * @return
     * @throws Exception
     */
    @AuthExclude
    @RequestMapping(value = "/main/deleteLoginUserInfo", method = RequestMethod.POST, produces = {MediaType.APPLICATION_JSON_VALUE})
    public void deleteLoginUserInfo(ModelMap model, HttpServletRequest request) throws Exception {
        System.out.println("삭제요청이왔습니다.");
        try {
            File file = new File(EgovProperties.getProperty("Globals.fileStorePath") + "/LOGIN_MNG/userInfo.txt");
            file.delete();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * 항공사진 판독시스템 (cs프로그램)에서 요청 하는 경우임.
     * 항공사진 판독시스템 > 주소검색
     *
     * @param params
     * @param model
     * @return
     * @throws Exception
     */
//	@AuthExclude
//	@RequestMapping(value = "/search/getRoadAddrCs.do", method = RequestMethod.POST, produces = "text/json; charset=utf8")
//	public ModelAndView getRoadAddrCs(@RequestParam HashMap<String, Object> params, HttpServletResponse response, HttpServletRequest request, ModelMap model) throws Exception {
//		ModelAndView mav= new ModelAndView();
////		HashMap<String, Object> jsonMap = new HashMap<String, Object>();
//		System.out.println("주소요청이왔습니다.");
//		try {
//			String apiUrl = "http://www.juso.go.kr/addrlink/addrLinkApi.do?confmKey=" + params.get("confmKey") + "&resultType=json";
//			apiUrl += "&countPerPage=1000";
//			apiUrl += "&keyword=" + URLEncoder.encode((String) params.get("roadAddr"), "UTF-8");
//
//			params.put("apiUrl", apiUrl);
//
//			Map<String, Object> map = mainPageService.getRoadAddr(params);
//			System.out.println(map.get("resultList"));
//			
//			mav.addObject("errorMessage", map.get("errorMessage"));
//			mav.addObject("result", map.get("resultList")); // 리스트
//			mav.addObject("yn", "y");
//		} catch (Exception e) {
//			e.printStackTrace();
//			mav.addObject("yn", "n");
//		}
//		mav.setViewName("jsonView");
//		response.setCharacterEncoding("UTF-8");
//		
//		return mav;
//	}
    @AuthExclude
    @RequestMapping(value = "/main/pwdChange.do")
    public String pwdChange(AuthVO vo, ModelMap modelMap, HttpServletRequest request) throws Exception {
        vo.setUserId(vo.getPasswordUserId());
        vo.setUserPwd(vo.getNewUserPwd());
        this.mainPageService.pwdChange(vo);

        return "json2View";
    }
}
