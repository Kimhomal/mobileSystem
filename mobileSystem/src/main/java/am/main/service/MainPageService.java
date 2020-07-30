package am.main.service;

import am.main.service.impl.AuthVO;
import egovframework.rte.psl.dataaccess.util.EgovMap;

import java.util.List;

public interface MainPageService {
    // 로그인 전 validation checking
    EgovMap loginChecking(AuthVO vo) throws Exception;

    // 사용자 정보 조회
    EgovMap selectUserInfo(AuthVO vo) throws Exception;

    // IP로 사용자 정보 조회
    EgovMap selectUserInfoByIp(String ipAddr) throws Exception;

    // 회원가입
    void insertUserInfo(AuthVO vo) throws Exception;

    // 아이디 중복확인
    EgovMap uniqueUserIdCheck(AuthVO vo) throws Exception;

    // 회원정보수정
    void updateUserInfo(AuthVO vo) throws Exception;

    // 시스템 접근로그
    void insertConnectStat(String mnuCd, String userId, String ipAddr) throws Exception;

    // 비밀번호 변경
    void pwdChange(AuthVO vo) throws Exception;

//	Map<String, Object> getRoadAddr(HashMap<String, Object> params) throws Exception;
}
