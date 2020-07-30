package am.main.service.impl;

import am.main.service.MainPageService;
import egovframework.rte.psl.dataaccess.util.EgovMap;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

@Service("mainPageService")
public class MainPageServiceImpl implements MainPageService {
    @Resource(name = "mainPageMapper")
    MainPageMapper mainPageMapper;

    @Override
    public EgovMap loginChecking(AuthVO vo) throws Exception {
        // 아이디, 패스워드 존재 유무 체크
        EgovMap resultMap = this.mainPageMapper.selectLoginUserInfo(vo);

        String rtnMsg = "";
        EgovMap rtnMap = new EgovMap();

        label:
        {

            if ((Integer) resultMap.get("errCnt") >= 5) {
                rtnMsg = "패스워드를 5회 이상 잘못 입력하셨습니다. 로그인을 차단 합니다.\n관리자에게 비밀번호 초기화를 요청하세요.";
                rtnMap.put("sof", "fail");
                rtnMap.put("msg", rtnMsg);
                break label;
            }
            if ("Y".equals(resultMap.get("idFlag").toString()) && "Y".equals(resultMap.get("pwdFlag").toString())) {
                if ((Integer) resultMap.get("diffAccessDays") > 90) {
                    rtnMsg = "접속이 3개월 지난 사용자 입니다. 관리자에게 문의하세요.";
                    rtnMap.put("sof", "fail");
                    rtnMap.put("msg", rtnMsg);
                    break label;
                }
                if ((Integer) resultMap.get("diffPwdDays") > 90) {
                    rtnMsg = "패스워드 변경날짜가 지났습니다(3개월). 패스워드 변경 후 다시 접속하세요.";
                    rtnMap.put("sof", "failPwd");
                    rtnMap.put("msg", rtnMsg);
                    break label;
                }
//				if( "N".equals( resultMap.get("ipFlag").toString())){
//					rtnMsg = "허용되지 않은 IP 입니다.";
//					rtnMap.put("sof", "fail");
//					rtnMap.put("msg", rtnMsg);
//					break label;
//				}
                if ("N".equals(resultMap.get("apprGbn").toString())) {
                    rtnMsg = "승인이 되지않았습니다. 관리자에게 승인 요청하세요.";
                    rtnMap.put("sof", "fail");
                    rtnMap.put("msg", rtnMsg);
                    break label;
                }
                if ("N".equals(resultMap.get("useFlag").toString())) {
                    rtnMsg = "사용할수 없는 사용자입니다. 관리자에게 문의하세요.";
                    rtnMap.put("sof", "fail");
                    rtnMap.put("msg", rtnMsg);
                    break label;
                }
                // 패스워드 오류 카운트 초기화
                this.mainPageMapper.updateInitErrorCnt(vo);
                // 접속날짜 update
                this.mainPageMapper.updateAccessDate(vo);
                rtnMsg = "로그인 되었습니다.";
                rtnMap.put("sof", "success");
                rtnMap.put("msg", rtnMsg);

                if ((Integer) resultMap.get("diffPwdDays") > 80 && (Integer) resultMap.get("diffPwdDays") <= 90) {
                    Integer diffDays = 91 - (Integer) resultMap.get("diffPwdDays");
                    String rtnMsg01 = "패스워드 변경날짜가 " + diffDays + "일 남았습니다. 패스워드를 변경하시기 바랍니다.";
                    rtnMap.put("msg01", rtnMsg01);
                }

            } else {
                if ("N".equals(resultMap.get("idFlag").toString())) {
                    rtnMsg = "입력하신 ID 가 맞지 않습니다.";
                    rtnMap.put("sof", "fail");
                    rtnMap.put("msg", rtnMsg);
                    break label;
                }
                if ("N".equals(resultMap.get("pwdFlag").toString())) {
                    this.mainPageMapper.updateErrorCnt(vo);
                    rtnMsg = "입력하신 패스워드가 맞지 않습니다.";
                    rtnMap.put("sof", "fail");
                    rtnMap.put("msg", rtnMsg);
                    break label;
                }
            }
        }

        return rtnMap;
    }

    // 사용자 정보 조회
    @Override
    public EgovMap selectUserInfo(AuthVO vo) throws Exception {
        return this.mainPageMapper.selectUserInfo(vo);
    }

    // 회원가입
    @Override
    public void insertUserInfo(AuthVO vo) throws Exception {
        this.mainPageMapper.insertUserInfo(vo);
    }

    // 회원정보수정
    @Override
    public void updateUserInfo(AuthVO vo) throws Exception {
        this.mainPageMapper.updateUserInfo(vo);
    }

    // 아이디 중복확인
    @Override
    public EgovMap uniqueUserIdCheck(AuthVO vo) throws Exception {
        String rtnStr = this.mainPageMapper.uniqueUserIdCheck(vo);

        EgovMap rtnMap = new EgovMap();

        if (rtnStr != null) {
            rtnMap.put("msg", "아이디가 존재합니다.");
            rtnMap.put("flag", false);
        }else{
            rtnMap.put("msg", "사용가능한 아이디 입니다.");
            rtnMap.put("flag", true);
        }

        return rtnMap;
    }

    // 시스템 접근로그
    @Override
    public void insertConnectStat(String mnuCd, String userId, String ipAddr) throws Exception {
        this.mainPageMapper.insertConnectStat(mnuCd, userId, ipAddr);
    }

    @Override
    public EgovMap selectUserInfoByIp(String ipAddr) throws Exception {
        return this.mainPageMapper.selectUserInfoByIp(ipAddr);
    }

//	@Override
//	public Map<String, Object> getRoadAddr(HashMap<String, Object> params) throws Exception {
//
//		Map<String, Object> map = null;
//
//		try {
//			URL url = new URL((String) params.get("apiUrl"));
//
//			HttpURLConnection conn = (HttpURLConnection) url.openConnection();
//
//			conn.setRequestProperty("Content-Type", "application/json");
//			conn.setDoOutput(true);
//			conn.setRequestMethod("GET");
//
//			BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), "UTF-8"));
//
//			StringBuffer sb = new StringBuffer();
//			String strTemp;
//
//			while ((strTemp = br.readLine()) != null) {
//				sb.append(strTemp);
//			}
//			br.close();
//
//			map = new HashMap<String, Object>();
//
//			JSONObject json = (JSONObject) (new JSONObject(sb.toString())).get("results");
//			JSONObject jsonCommon = (JSONObject) json.get("common");
//
//			int totalCount = Integer.parseInt((String) jsonCommon.get("totalCount"));
//			String errorCode = (String) jsonCommon.get("errorCode");
//
//			List<Object> resultList = null;
//
//			if (!"0".equals(errorCode)) {
//				map.put("errorMessage", jsonCommon.get("errorMessage"));
//			} else {
//				JSONArray jsonJuso = (JSONArray) json.get("juso");
//
//				resultList = new ArrayList<Object>();
//
//				for (int i = 0; i < jsonJuso.length(); i++) {
//
//					JSONObject tmpJsonObject = (JSONObject) jsonJuso.get(i);
//					// bdNm
//					@SuppressWarnings("unchecked")
//					Iterator<String> itr = tmpJsonObject.keys();
//
//					Map<String, Object> tmpMap = new HashMap<String, Object>();
//
//					while (itr.hasNext()) {
//						String key = itr.next();
//						tmpMap.put("name", key);
//						tmpMap.put("name", tmpJsonObject.get(key).toString());
//						// if (params.get("type").toString().equals(key)) {
//						// String keyVal = tmpJsonObject.get(key).toString();
//						// if(params.get("type").toString().equals("roadAddr")){
//						// tmpMap.put("name", keyVal);
//						//// tmpMap.put("key",
//						// tmpJsonObject.get("bdMgtSn").toString().substring(0,
//						// 19));
//						// tmpMap.put("key", tmpJsonObject.get("bdMgtSn"));
//						// }else{
//						// if(keyVal.equals("")||keyVal==null){
//						// tmpMap.put("road",
//						// tmpJsonObject.get("roadAddr").toString());
//						// tmpMap.put("name", "제공되는 명칭 없음");
//						// tmpMap.put("key", tmpJsonObject.get("bdMgtSn"));
//						// }
//						// else{
//						// tmpMap.put("road",
//						// tmpJsonObject.get("roadAddr").toString());
//						// tmpMap.put("name", keyVal);
//						// tmpMap.put("key", tmpJsonObject.get("bdMgtSn"));
//						// }
//						// }
//						//
//						// }
//						// else if ("bdMgtSn".equals(key)) {
//						// if(tmpJsonObject.get("bdNm").toString().equals("")||tmpJsonObject.get(key).toString()==null){
//						//
//						// }else{
//						// String value = (String) tmpJsonObject.get(key);
//						// tmpMap.put("key", value.substring(0, 19));
//						// }
//						// }
//					}
//					if (!tmpMap.isEmpty()) {
//						resultList.add(tmpMap);
//					}
//				}
//			}
//			map.put("resultList", resultList);
//
//			map.put("totalRows", jsonCommon.get("totalCount"));
//		} catch (Exception e) {
//			e.printStackTrace();
//			map = null;
//		}
//
//		return map;
//	}


    @Override
    public void pwdChange(AuthVO vo) throws Exception {
        this.mainPageMapper.pwdChange(vo);
    }
}
