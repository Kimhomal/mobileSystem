package am.main.service.impl;

import egovframework.rte.psl.dataaccess.mapper.Mapper;
import egovframework.rte.psl.dataaccess.util.EgovMap;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper("mainPageMapper")
public interface MainPageMapper {
    // 아이디, 패스워드 존재 유무 체크
    EgovMap selectLoginUserInfo(AuthVO vo) throws Exception;

    // 패스워드 에러횟수 조회
    Integer selectErrorCnt(AuthVO vo) throws Exception;

    // 패스워드 오류 카운트 초기화
    void updateInitErrorCnt(AuthVO vo) throws Exception;

    // 패스워드 오류 업데이트
    void updateErrorCnt(AuthVO vo) throws Exception;

    // 접속날짜 update
    void updateAccessDate(AuthVO vo) throws Exception;

    // 사용자 정보 조회
    EgovMap selectUserInfo(AuthVO vo) throws Exception;

    // IP로 사용자 정보 조회
    EgovMap selectUserInfoByIp(String ipAddr) throws Exception;

    // 회원가입
    void insertUserInfo(AuthVO vo) throws Exception;

    // 회원정보수정
    void updateUserInfo(AuthVO vo) throws Exception;

    // 아이디 중복확인
    String uniqueUserIdCheck(AuthVO vo) throws Exception;

    // 시스템 접근로그
    void insertConnectStat(@Param("mnuCd") String mnuCd, @Param("userId") String userId, @Param("ipAddr") String ipAddr) throws Exception;

    // 비밀번호 변경
    void pwdChange(AuthVO vo) throws Exception;
}
