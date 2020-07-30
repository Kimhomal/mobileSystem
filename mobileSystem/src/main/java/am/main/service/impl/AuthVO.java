package am.main.service.impl;

import java.util.ArrayList;
import java.util.HashMap;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;

public class AuthVO 
{
	private String searchUserId;
	private String searchUserPwd;
	private String searchIpAddr;
	
	private String userId;
	private String userNm;
	private String userPwd;
	private String telNo;
	private String userPrivil;
	private String errCnt;
	private String ipAddr;
	private String mailAddr;
	private String userOrgan;
	private String userDpt;
	private String pwdChgDt;
	private String accessDt;
	private String apprGbn;
	private String useFlag;
	private String insDt;
	private String insTm;
	private String insUser;
	private String uptDt;
	private String uptTm;
	private String uptUser;
	private String organCd;
	private String organNm;
	private String dptNm;
	private ArrayList<HashMap<String, String>> typeList;
	private String grade;
	private Integer gradeArrayCnt;
	private String strAttr2;
	private String newUserPwd;
	private String passwordUserId;
	
	public Integer getGradeArrayCnt() {
		return gradeArrayCnt;
	}
	public void setGradeArrayCnt(Integer gradeArrayCnt) {
		this.gradeArrayCnt = gradeArrayCnt;
	}
	public String getGrade() {
		return grade;
	}
	public void setGrade(String grade) {
		this.grade = grade;
	}
	public String getSearchIpAddr() {
		return searchIpAddr;
	}
	public void setSearchIpAddr(String searchIpAddr) {
		this.searchIpAddr = searchIpAddr;
	}
	public String getOrganNm() {
		return organNm;
	}
	public void setOrganNm(String organNm) {
		this.organNm = organNm;
	}
	public String getDptNm() {
		return dptNm;
	}
	public void setDptNm(String dptNm) {
		this.dptNm = dptNm;
	}
	public String getSearchUserId() {
		return searchUserId;
	}
	public void setSearchUserId(String searchUserId) {
		this.searchUserId = searchUserId;
	}
	public String getSearchUserPwd() {
		return searchUserPwd;
	}
	public void setSearchUserPwd(String searchUserPwd) {
		this.searchUserPwd = searchUserPwd;
	}
	public String getUserId() {
		return userId;
	}
	public void setUserId(String userId) {
		this.userId = userId;
	}
	public String getUserNm() {
		return userNm;
	}
	public void setUserNm(String userNm) {
		this.userNm = userNm;
	}
	public String getUserPwd() {
		return userPwd;
	}
	public void setUserPwd(String userPwd) {
		this.userPwd = userPwd;
	}
	public String getTelNo() {
		return telNo;
	}
	public void setTelNo(String telNo) {
		this.telNo = telNo;
	}
	public String getUserPrivil() {
		return userPrivil;
	}
	public void setUserPrivil(String userPrivil) {
		this.userPrivil = userPrivil;
	}
	public String getErrCnt() {
		return errCnt;
	}
	public void setErrCnt(String errCnt) {
		this.errCnt = errCnt;
	}
	public String getIpAddr() {
		return ipAddr;
	}
	public void setIpAddr(String ipAddr) {
		this.ipAddr = ipAddr;
	}
	public String getMailAddr() {
		return mailAddr;
	}
	public void setMailAddr(String mailAddr) {
		this.mailAddr = mailAddr;
	}
	public String getUserOrgan() {
		return userOrgan;
	}
	public void setUserOrgan(String userOrgan) {
		this.userOrgan = userOrgan;
	}
	public String getUserDpt() {
		return userDpt;
	}
	public void setUserDpt(String userDpt) {
		this.userDpt = userDpt;
	}
	public String getPwdChgDt() {
		return pwdChgDt;
	}
	public void setPwdChgDt(String pwdChgDt) {
		this.pwdChgDt = pwdChgDt;
	}
	public String getAccessDt() {
		return accessDt;
	}
	public void setAccessDt(String accessDt) {
		this.accessDt = accessDt;
	}
	public String getApprGbn() {
		return apprGbn;
	}
	public void setApprGbn(String apprGbn) {
		this.apprGbn = apprGbn;
	}
	public String getUseFlag() {
		return useFlag;
	}
	public void setUseFlag(String useFlag) {
		this.useFlag = useFlag;
	}
	public String getInsDt() {
		return insDt;
	}
	public void setInsDt(String insDt) {
		this.insDt = insDt;
	}
	public String getInsTm() {
		return insTm;
	}
	public void setInsTm(String insTm) {
		this.insTm = insTm;
	}
	public String getInsUser() {
		return insUser;
	}
	public void setInsUser(String insUser) {
		this.insUser = insUser;
	}
	public String getUptDt() {
		return uptDt;
	}
	public void setUptDt(String uptDt) {
		this.uptDt = uptDt;
	}
	public String getUptTm() {
		return uptTm;
	}
	public void setUptTm(String uptTm) {
		this.uptTm = uptTm;
	}
	public String getUptUser() {
		return uptUser;
	}
	public void setUptUser(String uptUser) {
		this.uptUser = uptUser;
	}
	public String getOrganCd() {
		return organCd;
	}
	public void setOrganCd(String organCd) {
		this.organCd = organCd;
	}
	public ArrayList<HashMap<String, String>> getTypeList() {
		return typeList;
	}
	public void setTypeList(ArrayList<HashMap<String, String>> typeList) {
		this.typeList = typeList;
	}
	public String getStrAttr2() {
		return strAttr2;
	}
	public void setStrAttr2(String strAttr2) {
		this.strAttr2 = strAttr2;
	}
	@Override
	public String toString() {
		return ToStringBuilder.reflectionToString(this, ToStringStyle.MULTI_LINE_STYLE);
	}

	public String getNewUserPwd() {
		return newUserPwd;
	}

	public void setNewUserPwd(String newUserPwd) {
		this.newUserPwd = newUserPwd;
	}

	public String getPasswordUserId() {
		return passwordUserId;
	}

	public void setPasswordUserId(String passwordUserId) {
		this.passwordUserId = passwordUserId;
	}
}
