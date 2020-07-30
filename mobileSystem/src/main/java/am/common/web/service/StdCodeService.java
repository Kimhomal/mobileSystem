package am.common.web.service;

import java.util.List;

public interface StdCodeService {

	// 표준코드 리스트 조회
	List<?> selectStdCodeList(String stdGrp) throws Exception;
}
