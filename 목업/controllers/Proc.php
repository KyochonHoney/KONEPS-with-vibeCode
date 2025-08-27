<?php
defined('BASEPATH') OR exit('No direct script access allowed');
class Proc extends CI_Controller {
	function __construct()
	{
		parent::__construct();		
		header('Content-Type: application/json');	
	}

    public function login()
    {
		$ID = $this->input->post('ID');
		$PW = $this->input->post('PW');
		
		if(!$ID || !$PW) 
		{
			echo json_encode('FAIL');
			exit;
		}

		$result = $this->Proc_m->login_proc($ID, $PW);

        echo json_encode($result);
    }

    public function logout()
    {
        $this->session->unset_userdata('logged_in');
		$this->session->unset_userdata('USER_CODE');
		$this->session->unset_userdata('USER_NAME');

		$this->session->sess_destroy();

		redirect('/login');
    }

	public function upload_files_proc()
	{
		if($_POST['parent_idx'] != '') {
			echo json_encode($this->Proc_m->update_files_proc($_POST, $_FILES));
		} 
		echo json_encode($this->Proc_m->upload_files_proc($_POST, $_FILES));
	}

	public function del_all()
	{
		echo json_encode($this->Proc_m->del_all_proc($_POST));
	}

	public function download()
	{
		$this->load->helper('download');
		$directory = $this->input->get('directory');
		$file_name = $this->input->get('file_name');
		$real_name = $this->input->get('real_name');
		$data = file_get_contents($_SERVER["DOCUMENT_ROOT"].$directory.$file_name); 
		$name = $real_name;
		force_download($name, $data);
	}

	public function uploadTenderNotice()
	{
		//echo json_encode($this->input->post('bidNtceNo'). "asdfasdfasdf"); exit;
		$baseUrl = 'https://apis.data.go.kr/1230000/ad/BidPublicInfoService/getBidPblancListInfoServc';
		$params = [];
		$params['serviceKey']  = $this->config->item('serviceKey');
		$params['pageNo']      = "1";
		$params['numOfRows']   = "50";
		$params['inqryDiv']    = "1";
		$params['inqryBgnDt']  = date('Ymd', strtotime("-1 Month")) . "0000";
		$params['inqryEndDt']  = date('Ymd') . "0000";
		$params['bidNtceNo']   = trim($this->input->post('bidNtceNo'));
		if($params['bidNtceNo'] == '') {
			echo json_encode('FAIL');
			exit;
		}
		$resp = $this->getCurlResponse($baseUrl, $params);
		$itemsCount    = 0;
		$insertedCount = 0;
		$skippedCount  = 0;

		$parsed = $resp['parsed'];
		if (is_array($parsed) && isset($parsed['body']['items'])) {
			$items = $parsed['body']['items'];

			// items가 빈 객체/빈 배열일 수 있음
			if (!empty($items)) {
				$itemList = $items['item'] ?? [];
				if (isset($itemList['bidNtceNo'])) {
					// 단일 객체
					$itemList = [$itemList];
				}
				if (is_array($itemList)) {
					$itemsCount = count($itemList);

					foreach ($itemList as $item) {
						$clsfcNo = $item['pubPrcrmntClsfcNo'] ?? null;

						$bidNo  = $item['bidNtceNo'] ?? '';
						$bidOrd = $item['bidNtceOrd'] ?? '';
						if($params['bidNtceNo'] != $item['bidNtceNo']) {
							continue;
						}
						if (!$bidNo) { continue; }
						$exists = $this->db
							->where('bidNtceNo', $bidNo)
							->where('bidNtceOrd', $bidOrd)
							->count_all_results('tender_notices');

						if ($exists > 0) {
							$skippedCount++;
							continue;
						}
						$normalized = [];
						foreach ($item as $k => $v) { $normalized[$k] = $this->normalizeValue($v); }
						$data = [
							'bidNtceNo'              => $bidNo,
							'bidNtceOrd'             => $bidOrd,

							'reNtceYn'               => $this->v($normalized, 'reNtceYn'),
							'rgstTyNm'               => $this->v($normalized, 'rgstTyNm'),
							'ntceKindNm'             => $this->v($normalized, 'ntceKindNm'),
							'intrbidYn'              => $this->v($normalized, 'intrbidYn'),
							'bidNtceDt'              => $this->v($normalized, 'bidNtceDt'),
							'refNo'                  => $this->v($normalized, 'refNo'),
							'bidNtceNm'              => $this->v($normalized, 'bidNtceNm'),
							'ntceInsttCd'            => $this->v($normalized, 'ntceInsttCd'),
							'ntceInsttNm'            => $this->v($normalized, 'ntceInsttNm'),
							'dminsttCd'              => $this->v($normalized, 'dminsttCd'),
							'dminsttNm'              => $this->v($normalized, 'dminsttNm'),
							'bidMethdNm'             => $this->v($normalized, 'bidMethdNm'),
							'cntrctCnclsMthdNm'      => $this->v($normalized, 'cntrctCnclsMthdNm'),
							'ntceInsttOfclNm'        => $this->v($normalized, 'ntceInsttOfclNm'),
							'ntceInsttOfclTelNo'     => $this->v($normalized, 'ntceInsttOfclTelNo'),
							'ntceInsttOfclEmailAdrs' => $this->v($normalized, 'ntceInsttOfclEmailAdrs'),
							'exctvNm'                => $this->v($normalized, 'exctvNm'),

							'bidQlfctRgstDt'         => $this->v($normalized, 'bidQlfctRgstDt'),
							'cmmnSpldmdAgrmntRcptdocMethd' => $this->v($normalized, 'cmmnSpldmdAgrmntRcptdocMethd'),
							'cmmnSpldmdAgrmntClseDt' => $this->v($normalized, 'cmmnSpldmdAgrmntClseDt'),
							'cmmnSpldmdCorpRgnLmtYn' => $this->v($normalized, 'cmmnSpldmdCorpRgnLmtYn'),

							'bidBeginDt'             => $this->v($normalized, 'bidBeginDt'),
							'bidClseDt'              => $this->v($normalized, 'bidClseDt'),
							'opengDt'                => $this->v($normalized, 'opengDt'),

							'ntceSpecDocUrl1'        => $this->v($normalized, 'ntceSpecDocUrl1'),
							'ntceSpecDocUrl2'        => $this->v($normalized, 'ntceSpecDocUrl2'),
							'ntceSpecDocUrl3'        => $this->v($normalized, 'ntceSpecDocUrl3'),
							'ntceSpecDocUrl4'        => $this->v($normalized, 'ntceSpecDocUrl4'),
							'ntceSpecDocUrl5'        => $this->v($normalized, 'ntceSpecDocUrl5'),
							'ntceSpecDocUrl6'        => $this->v($normalized, 'ntceSpecDocUrl6'),
							'ntceSpecDocUrl7'        => $this->v($normalized, 'ntceSpecDocUrl7'),
							'ntceSpecDocUrl8'        => $this->v($normalized, 'ntceSpecDocUrl8'),
							'ntceSpecDocUrl9'        => $this->v($normalized, 'ntceSpecDocUrl9'),
							'ntceSpecDocUrl10'       => $this->v($normalized, 'ntceSpecDocUrl10'),

							'ntceSpecFileNm1'        => $this->v($normalized, 'ntceSpecFileNm1'),
							'ntceSpecFileNm2'        => $this->v($normalized, 'ntceSpecFileNm2'),
							'ntceSpecFileNm3'        => $this->v($normalized, 'ntceSpecFileNm3'),
							'ntceSpecFileNm4'        => $this->v($normalized, 'ntceSpecFileNm4'),
							'ntceSpecFileNm5'        => $this->v($normalized, 'ntceSpecFileNm5'),
							'ntceSpecFileNm6'        => $this->v($normalized, 'ntceSpecFileNm6'),
							'ntceSpecFileNm7'        => $this->v($normalized, 'ntceSpecFileNm7'),
							'ntceSpecFileNm8'        => $this->v($normalized, 'ntceSpecFileNm8'),
							'ntceSpecFileNm9'        => $this->v($normalized, 'ntceSpecFileNm9'),
							'ntceSpecFileNm10'       => $this->v($normalized, 'ntceSpecFileNm10'),

							'rbidPermsnYn'           => $this->v($normalized, 'rbidPermsnYn'),
							'pqApplDocRcptMthdNm'    => $this->v($normalized, 'pqApplDocRcptMthdNm'),
							'pqApplDocRcptDt'        => $this->v($normalized, 'pqApplDocRcptDt'),
							'tpEvalApplMthdNm'       => $this->v($normalized, 'tpEvalApplMthdNm'),
							'tpEvalApplClseDt'       => $this->v($normalized, 'tpEvalApplClseDt'),

							'jntcontrctDutyRgnNm1'   => $this->v($normalized, 'jntcontrctDutyRgnNm1'),
							'jntcontrctDutyRgnNm2'   => $this->v($normalized, 'jntcontrctDutyRgnNm2'),
							'jntcontrctDutyRgnNm3'   => $this->v($normalized, 'jntcontrctDutyRgnNm3'),
							'rgnDutyJntcontrctRt'    => $this->v($normalized, 'rgnDutyJntcontrctRt'),

							'dtlsBidYn'              => $this->v($normalized, 'dtlsBidYn'),
							'bidPrtcptLmtYn'         => $this->v($normalized, 'bidPrtcptLmtYn'),
							'prearngPrceDcsnMthdNm'  => $this->v($normalized, 'prearngPrceDcsnMthdNm'),
							'totPrdprcNum'           => $this->v($normalized, 'totPrdprcNum'),
							'drwtPrdprcNum'          => $this->v($normalized, 'drwtPrdprcNum'),

							'asignBdgtAmt'           => $this->v($normalized, 'asignBdgtAmt'),
							'presmptPrce'            => $this->v($normalized, 'presmptPrce'),
							'opengPlce'              => $this->v($normalized, 'opengPlce'),

							'dcmtgOprtnDt'           => $this->v($normalized, 'dcmtgOprtnDt'),
							'dcmtgOprtnPlce'         => $this->v($normalized, 'dcmtgOprtnPlce'),

							'bidNtceDtlUrl'          => $this->v($normalized, 'bidNtceDtlUrl'),
							'bidNtceUrl'             => $this->v($normalized, 'bidNtceUrl'),

							'bidPrtcptFeePaymntYn'   => $this->v($normalized, 'bidPrtcptFeePaymntYn'),
							'bidPrtcptFee'           => $this->v($normalized, 'bidPrtcptFee'),
							'bidGrntymnyPaymntYn'    => $this->v($normalized, 'bidGrntymnyPaymntYn'),

							'crdtrNm'                => $this->v($normalized, 'crdtrNm'),
							'ppswGnrlSrvceYn'        => $this->v($normalized, 'ppswGnrlSrvceYn'),
							'srvceDivNm'             => $this->v($normalized, 'srvceDivNm'),
							'prdctClsfcLmtYn'        => $this->v($normalized, 'prdctClsfcLmtYn'),
							'mnfctYn'                => $this->v($normalized, 'mnfctYn'),
							'purchsObjPrdctList'     => $this->v($normalized, 'purchsObjPrdctList'),

							'untyNtceNo'             => $this->v($normalized, 'untyNtceNo'),
							'cmmnSpldmdMethdCd'      => $this->v($normalized, 'cmmnSpldmdMethdCd'),
							'cmmnSpldmdMethdNm'      => $this->v($normalized, 'cmmnSpldmdMethdNm'),
							'stdNtceDocUrl'          => $this->v($normalized, 'stdNtceDocUrl'),
							'brffcBidprcPermsnYn'    => $this->v($normalized, 'brffcBidprcPermsnYn'),

							'dsgntCmptYn'            => $this->v($normalized, 'dsgntCmptYn'),
							'arsltCmptYn'            => $this->v($normalized, 'arsltCmptYn'),
							'pqEvalYn'               => $this->v($normalized, 'pqEvalYn'),
							'tpEvalYn'               => $this->v($normalized, 'tpEvalYn'),
							'ntceDscrptYn'           => $this->v($normalized, 'ntceDscrptYn'),
							'rsrvtnPrceReMkngMthdNm' => $this->v($normalized, 'rsrvtnPrceReMkngMthdNm'),
							'arsltApplDocRcptMthdNm' => $this->v($normalized, 'arsltApplDocRcptMthdNm'),
							'arsltReqstdocRcptDt'    => $this->v($normalized, 'arsltReqstdocRcptDt'),

							'orderPlanUntyNo'        => $this->v($normalized, 'orderPlanUntyNo'),
							'sucsfbidLwltRate'       => $this->v($normalized, 'sucsfbidLwltRate'),
							'rgstDt'                 => $this->v($normalized, 'rgstDt'),
							'bfSpecRgstNo'           => $this->v($normalized, 'bfSpecRgstNo'),
							'infoBizYn'              => $this->v($normalized, 'infoBizYn'),

							'sucsfbidMthdCd'         => $this->v($normalized, 'sucsfbidMthdCd'),
							'sucsfbidMthdNm'         => $this->v($normalized, 'sucsfbidMthdNm'),
							'chgDt'                  => $this->v($normalized, 'chgDt'),

							'dminsttOfclEmailAdrs'   => $this->v($normalized, 'dminsttOfclEmailAdrs'),
							'indstrytyLmtYn'         => $this->v($normalized, 'indstrytyLmtYn'),
							'chgNtceRsn'             => $this->v($normalized, 'chgNtceRsn'),

							'rbidOpengDt'            => $this->v($normalized, 'rbidOpengDt'),
							'VAT'                    => $this->v($normalized, 'VAT'),
							'indutyVAT'              => $this->v($normalized, 'indutyVAT'),

							'rgnLmtBidLocplcJdgmBssCd' => $this->v($normalized, 'rgnLmtBidLocplcJdgmBssCd'),
							'rgnLmtBidLocplcJdgmBssNm' => $this->v($normalized, 'rgnLmtBidLocplcJdgmBssNm'),

							'pubPrcrmntLrgClsfcNm'   => $this->v($normalized, 'pubPrcrmntLrgClsfcNm'),
							'pubPrcrmntMidClsfcNm'   => $this->v($normalized, 'pubPrcrmntMidClsfcNm'),
							'pubPrcrmntClsfcNo'      => $this->v($normalized, 'pubPrcrmntClsfcNo'),
							'pubPrcrmntClsfcNm'      => $this->v($normalized, 'pubPrcrmntClsfcNm'),

							'created_at'             => date('Y-m-d H:i:s'),
							'updated_at'             => date('Y-m-d H:i:s'),
						];

						$this->db->insert('tender_notices', $data);
						$insertedCount++;
					}
				}
			}
		}

		// 지역별 실행 로그 저장
		$this->logFetchRun([
			'run_at'         => date('Y-m-d H:i:s'),
			'region_code'    => "",
			'page_no'        => (int)$params['pageNo'],
			'num_of_rows'    => (int)$params['numOfRows'],
			'inqry_div'      => $params['inqryDiv'],
			'inqry_bgn_dt'   => "",
			'inqry_end_dt'   => "",
			'indstryty_cd'   => "",

			'http_status'    => $resp['http_status'],
			'curl_errno'     => $resp['curl_errno'],
			'curl_error'     => $resp['curl_error'] ?: null,

			'result_code'    => $resp['result_code'],
			'result_msg'     => $resp['result_msg'],

			'items_count'    => $itemsCount,
			'inserted_count' => $insertedCount,
			'skipped_count'  => $skippedCount,

			'request_url'    => $resp['request_url'],
			'note'           => null,
		]);

		// 크론에서 깔끔히 끝내기
		$this->output
			->set_content_type('application/json; charset=utf-8')
			->set_output(json_encode(['ok' => true], JSON_UNESCAPED_UNICODE));
	}

	public function getTenderNoticeList()
	{
		$baseUrl = 'https://apis.data.go.kr/1230000/ad/BidPublicInfoService/getBidPblancListInfoServcPPSSrch';
		$params = [];
		$params['serviceKey']  = $this->config->item('serviceKey');
		$params['pageNo']      = "1";
		$params['numOfRows']   = "50";
		$params['inqryDiv']    = "1";
		$params['inqryBgnDt']  = date('Ymd', strtotime("-1 DAY")) . "0000";
		$params['inqryEndDt']  = date('Ymd', strtotime("-1 DAY")) . "2359";
		$prtcptLmtRgnCds       = ["", "11", "41"];
		$params['indstrytyCd'] = "1468";
		$allowedClsfc = [
			'81112002', '81112299', '81111811',
			'81111899', '81112199', '81111598', '81111599'
		];

		foreach ($prtcptLmtRgnCds as $prtcptLmtRgnCd) {
			$params['prtcptLmtRgnCd'] = $prtcptLmtRgnCd;

			$resp = $this->getCurlResponse($baseUrl, $params);

			$itemsCount    = 0;
			$insertedCount = 0;
			$skippedCount  = 0;

			// 파싱 성공 여부 체크
			$parsed = $resp['parsed'];
			if (is_array($parsed) && isset($parsed['body']['items'])) {
				$items = $parsed['body']['items'];

				// items가 빈 객체/빈 배열일 수 있음
				if (!empty($items)) {
					$itemList = $items['item'] ?? [];
					if (isset($itemList['bidNtceNo'])) {
						// 단일 객체
						$itemList = [$itemList];
					}
					if (is_array($itemList)) {
						$itemsCount = count($itemList);

						foreach ($itemList as $item) {
							$clsfcNo = $item['pubPrcrmntClsfcNo'] ?? null;

							$bidNo  = $item['bidNtceNo'] ?? '';
							$bidOrd = $item['bidNtceOrd'] ?? '';

							if (!$bidNo) { continue; }
							if (!$clsfcNo || !in_array($clsfcNo, $allowedClsfc, true)) {
								continue;
							}
							$exists = $this->db
								->where('bidNtceNo', $bidNo)
								->where('bidNtceOrd', $bidOrd)
								->count_all_results('tender_notices');

							if ($exists > 0) {
								$skippedCount++;
								continue;
							}
							$normalized = [];
							foreach ($item as $k => $v) { $normalized[$k] = $this->normalizeValue($v); }
							$data = [
								'bidNtceNo'              => $bidNo,
								'bidNtceOrd'             => $bidOrd,
								'prtcptLmtRgnCd'         => $prtcptLmtRgnCd,

								'reNtceYn'               => $this->v($normalized, 'reNtceYn'),
								'rgstTyNm'               => $this->v($normalized, 'rgstTyNm'),
								'ntceKindNm'             => $this->v($normalized, 'ntceKindNm'),
								'intrbidYn'              => $this->v($normalized, 'intrbidYn'),
								'bidNtceDt'              => $this->v($normalized, 'bidNtceDt'),
								'refNo'                  => $this->v($normalized, 'refNo'),
								'bidNtceNm'              => $this->v($normalized, 'bidNtceNm'),
								'ntceInsttCd'            => $this->v($normalized, 'ntceInsttCd'),
								'ntceInsttNm'            => $this->v($normalized, 'ntceInsttNm'),
								'dminsttCd'              => $this->v($normalized, 'dminsttCd'),
								'dminsttNm'              => $this->v($normalized, 'dminsttNm'),
								'bidMethdNm'             => $this->v($normalized, 'bidMethdNm'),
								'cntrctCnclsMthdNm'      => $this->v($normalized, 'cntrctCnclsMthdNm'),
								'ntceInsttOfclNm'        => $this->v($normalized, 'ntceInsttOfclNm'),
								'ntceInsttOfclTelNo'     => $this->v($normalized, 'ntceInsttOfclTelNo'),
								'ntceInsttOfclEmailAdrs' => $this->v($normalized, 'ntceInsttOfclEmailAdrs'),
								'exctvNm'                => $this->v($normalized, 'exctvNm'),

								'bidQlfctRgstDt'         => $this->v($normalized, 'bidQlfctRgstDt'),
								'cmmnSpldmdAgrmntRcptdocMethd' => $this->v($normalized, 'cmmnSpldmdAgrmntRcptdocMethd'),
								'cmmnSpldmdAgrmntClseDt' => $this->v($normalized, 'cmmnSpldmdAgrmntClseDt'),
								'cmmnSpldmdCorpRgnLmtYn' => $this->v($normalized, 'cmmnSpldmdCorpRgnLmtYn'),

								'bidBeginDt'             => $this->v($normalized, 'bidBeginDt'),
								'bidClseDt'              => $this->v($normalized, 'bidClseDt'),
								'opengDt'                => $this->v($normalized, 'opengDt'),

								'ntceSpecDocUrl1'        => $this->v($normalized, 'ntceSpecDocUrl1'),
								'ntceSpecDocUrl2'        => $this->v($normalized, 'ntceSpecDocUrl2'),
								'ntceSpecDocUrl3'        => $this->v($normalized, 'ntceSpecDocUrl3'),
								'ntceSpecDocUrl4'        => $this->v($normalized, 'ntceSpecDocUrl4'),
								'ntceSpecDocUrl5'        => $this->v($normalized, 'ntceSpecDocUrl5'),
								'ntceSpecDocUrl6'        => $this->v($normalized, 'ntceSpecDocUrl6'),
								'ntceSpecDocUrl7'        => $this->v($normalized, 'ntceSpecDocUrl7'),
								'ntceSpecDocUrl8'        => $this->v($normalized, 'ntceSpecDocUrl8'),
								'ntceSpecDocUrl9'        => $this->v($normalized, 'ntceSpecDocUrl9'),
								'ntceSpecDocUrl10'       => $this->v($normalized, 'ntceSpecDocUrl10'),

								'ntceSpecFileNm1'        => $this->v($normalized, 'ntceSpecFileNm1'),
								'ntceSpecFileNm2'        => $this->v($normalized, 'ntceSpecFileNm2'),
								'ntceSpecFileNm3'        => $this->v($normalized, 'ntceSpecFileNm3'),
								'ntceSpecFileNm4'        => $this->v($normalized, 'ntceSpecFileNm4'),
								'ntceSpecFileNm5'        => $this->v($normalized, 'ntceSpecFileNm5'),
								'ntceSpecFileNm6'        => $this->v($normalized, 'ntceSpecFileNm6'),
								'ntceSpecFileNm7'        => $this->v($normalized, 'ntceSpecFileNm7'),
								'ntceSpecFileNm8'        => $this->v($normalized, 'ntceSpecFileNm8'),
								'ntceSpecFileNm9'        => $this->v($normalized, 'ntceSpecFileNm9'),
								'ntceSpecFileNm10'       => $this->v($normalized, 'ntceSpecFileNm10'),

								'rbidPermsnYn'           => $this->v($normalized, 'rbidPermsnYn'),
								'pqApplDocRcptMthdNm'    => $this->v($normalized, 'pqApplDocRcptMthdNm'),
								'pqApplDocRcptDt'        => $this->v($normalized, 'pqApplDocRcptDt'),
								'tpEvalApplMthdNm'       => $this->v($normalized, 'tpEvalApplMthdNm'),
								'tpEvalApplClseDt'       => $this->v($normalized, 'tpEvalApplClseDt'),

								'jntcontrctDutyRgnNm1'   => $this->v($normalized, 'jntcontrctDutyRgnNm1'),
								'jntcontrctDutyRgnNm2'   => $this->v($normalized, 'jntcontrctDutyRgnNm2'),
								'jntcontrctDutyRgnNm3'   => $this->v($normalized, 'jntcontrctDutyRgnNm3'),
								'rgnDutyJntcontrctRt'    => $this->v($normalized, 'rgnDutyJntcontrctRt'),

								'dtlsBidYn'              => $this->v($normalized, 'dtlsBidYn'),
								'bidPrtcptLmtYn'         => $this->v($normalized, 'bidPrtcptLmtYn'),
								'prearngPrceDcsnMthdNm'  => $this->v($normalized, 'prearngPrceDcsnMthdNm'),
								'totPrdprcNum'           => $this->v($normalized, 'totPrdprcNum'),
								'drwtPrdprcNum'          => $this->v($normalized, 'drwtPrdprcNum'),

								'asignBdgtAmt'           => $this->v($normalized, 'asignBdgtAmt'),
								'presmptPrce'            => $this->v($normalized, 'presmptPrce'),
								'opengPlce'              => $this->v($normalized, 'opengPlce'),

								'dcmtgOprtnDt'           => $this->v($normalized, 'dcmtgOprtnDt'),
								'dcmtgOprtnPlce'         => $this->v($normalized, 'dcmtgOprtnPlce'),

								'bidNtceDtlUrl'          => $this->v($normalized, 'bidNtceDtlUrl'),
								'bidNtceUrl'             => $this->v($normalized, 'bidNtceUrl'),

								'bidPrtcptFeePaymntYn'   => $this->v($normalized, 'bidPrtcptFeePaymntYn'),
								'bidPrtcptFee'           => $this->v($normalized, 'bidPrtcptFee'),
								'bidGrntymnyPaymntYn'    => $this->v($normalized, 'bidGrntymnyPaymntYn'),

								'crdtrNm'                => $this->v($normalized, 'crdtrNm'),
								'ppswGnrlSrvceYn'        => $this->v($normalized, 'ppswGnrlSrvceYn'),
								'srvceDivNm'             => $this->v($normalized, 'srvceDivNm'),
								'prdctClsfcLmtYn'        => $this->v($normalized, 'prdctClsfcLmtYn'),
								'mnfctYn'                => $this->v($normalized, 'mnfctYn'),
								'purchsObjPrdctList'     => $this->v($normalized, 'purchsObjPrdctList'),

								'untyNtceNo'             => $this->v($normalized, 'untyNtceNo'),
								'cmmnSpldmdMethdCd'      => $this->v($normalized, 'cmmnSpldmdMethdCd'),
								'cmmnSpldmdMethdNm'      => $this->v($normalized, 'cmmnSpldmdMethdNm'),
								'stdNtceDocUrl'          => $this->v($normalized, 'stdNtceDocUrl'),
								'brffcBidprcPermsnYn'    => $this->v($normalized, 'brffcBidprcPermsnYn'),

								'dsgntCmptYn'            => $this->v($normalized, 'dsgntCmptYn'),
								'arsltCmptYn'            => $this->v($normalized, 'arsltCmptYn'),
								'pqEvalYn'               => $this->v($normalized, 'pqEvalYn'),
								'tpEvalYn'               => $this->v($normalized, 'tpEvalYn'),
								'ntceDscrptYn'           => $this->v($normalized, 'ntceDscrptYn'),
								'rsrvtnPrceReMkngMthdNm' => $this->v($normalized, 'rsrvtnPrceReMkngMthdNm'),
								'arsltApplDocRcptMthdNm' => $this->v($normalized, 'arsltApplDocRcptMthdNm'),
								'arsltReqstdocRcptDt'    => $this->v($normalized, 'arsltReqstdocRcptDt'),

								'orderPlanUntyNo'        => $this->v($normalized, 'orderPlanUntyNo'),
								'sucsfbidLwltRate'       => $this->v($normalized, 'sucsfbidLwltRate'),
								'rgstDt'                 => $this->v($normalized, 'rgstDt'),
								'bfSpecRgstNo'           => $this->v($normalized, 'bfSpecRgstNo'),
								'infoBizYn'              => $this->v($normalized, 'infoBizYn'),

								'sucsfbidMthdCd'         => $this->v($normalized, 'sucsfbidMthdCd'),
								'sucsfbidMthdNm'         => $this->v($normalized, 'sucsfbidMthdNm'),
								'chgDt'                  => $this->v($normalized, 'chgDt'),

								'dminsttOfclEmailAdrs'   => $this->v($normalized, 'dminsttOfclEmailAdrs'),
								'indstrytyLmtYn'         => $this->v($normalized, 'indstrytyLmtYn'),
								'chgNtceRsn'             => $this->v($normalized, 'chgNtceRsn'),

								'rbidOpengDt'            => $this->v($normalized, 'rbidOpengDt'),
								'VAT'                    => $this->v($normalized, 'VAT'),
								'indutyVAT'              => $this->v($normalized, 'indutyVAT'),

								'rgnLmtBidLocplcJdgmBssCd' => $this->v($normalized, 'rgnLmtBidLocplcJdgmBssCd'),
								'rgnLmtBidLocplcJdgmBssNm' => $this->v($normalized, 'rgnLmtBidLocplcJdgmBssNm'),

								'pubPrcrmntLrgClsfcNm'   => $this->v($normalized, 'pubPrcrmntLrgClsfcNm'),
								'pubPrcrmntMidClsfcNm'   => $this->v($normalized, 'pubPrcrmntMidClsfcNm'),
								'pubPrcrmntClsfcNo'      => $this->v($normalized, 'pubPrcrmntClsfcNo'),
								'pubPrcrmntClsfcNm'      => $this->v($normalized, 'pubPrcrmntClsfcNm'),

								'created_at'             => date('Y-m-d H:i:s'),
								'updated_at'             => date('Y-m-d H:i:s'),
							];

							$this->db->insert('tender_notices', $data);
							$insertedCount++;
						}
					}
				}
			}

			// 지역별 실행 로그 저장
			$this->logFetchRun([
				'run_at'         => date('Y-m-d H:i:s'),
				'region_code'    => $prtcptLmtRgnCd,
				'page_no'        => (int)$params['pageNo'],
				'num_of_rows'    => (int)$params['numOfRows'],
				'inqry_div'      => $params['inqryDiv'],
				'inqry_bgn_dt'   => $params['inqryBgnDt'],
				'inqry_end_dt'   => $params['inqryEndDt'],
				'indstryty_cd'   => $params['indstrytyCd'],

				'http_status'    => $resp['http_status'],
				'curl_errno'     => $resp['curl_errno'],
				'curl_error'     => $resp['curl_error'] ?: null,

				'result_code'    => $resp['result_code'],
				'result_msg'     => $resp['result_msg'],

				'items_count'    => $itemsCount,
				'inserted_count' => $insertedCount,
				'skipped_count'  => $skippedCount,

				'request_url'    => $resp['request_url'],
				'note'           => null,
			]);
		}

		// 크론에서 깔끔히 끝내기
		$this->output
			->set_content_type('application/json; charset=utf-8')
			->set_output(json_encode(['ok' => true], JSON_UNESCAPED_UNICODE));
	}

	public function getCurlResponse(string $url, array $params): array
	{
		$query = http_build_query($params, '', '&', PHP_QUERY_RFC3986);
		$requestUrl = $url . '?' . $query;

		$ch = curl_init();
		curl_setopt_array($ch, [
			CURLOPT_URL            => $requestUrl,
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_CONNECTTIMEOUT => 5,
			CURLOPT_TIMEOUT        => 15,
			CURLOPT_SSL_VERIFYPEER => false,
			CURLOPT_HTTPHEADER     => ['Accept: */*'],
		]);
		$response = curl_exec($ch);
		$errno    = curl_errno($ch);
		$error    = curl_error($ch);
		$status   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		curl_close($ch);

		$parsed = null; $resultCode = null; $resultMsg = null;
		if ($response) {
			libxml_use_internal_errors(true);
			$xml = simplexml_load_string($response);
			if ($xml !== false) {
				$arr = json_decode(json_encode($xml), true);
				$parsed = $arr;
				// header result
				if (isset($arr['header'])) {
					$resultCode = $arr['header']['resultCode'] ?? null;
					$resultMsg  = $arr['header']['resultMsg'] ?? null;
				}
			}
		}

		return [
			'http_status'  => $status,
			'curl_errno'   => $errno,
			'curl_error'   => $error,
			'request_url'  => $requestUrl,
			'parsed'       => $parsed,
			'result_code'  => $resultCode,
			'result_msg'   => $resultMsg,
		];
	}


	private function logFetchRun(array $log)
	{
		// 컬럼 매핑 안전하게
		$row = [
			'run_at'         => $log['run_at'] ?? date('Y-m-d H:i:s'),
			'region_code'    => $log['region_code'] ?? '',
			'page_no'        => $log['page_no'] ?? null,
			'num_of_rows'    => $log['num_of_rows'] ?? null,
			'inqry_div'      => $log['inqry_div'] ?? null,
			'inqry_bgn_dt'   => $log['inqry_bgn_dt'] ?? null,
			'inqry_end_dt'   => $log['inqry_end_dt'] ?? null,
			'indstryty_cd'   => $log['indstryty_cd'] ?? null,

			'http_status'    => $log['http_status'] ?? null,
			'curl_errno'     => $log['curl_errno'] ?? null,
			'curl_error'     => $log['curl_error'] ?? null,

			'result_code'    => $log['result_code'] ?? null,
			'result_msg'     => $log['result_msg'] ?? null,

			'items_count'    => $log['items_count'] ?? 0,
			'inserted_count' => $log['inserted_count'] ?? 0,
			'skipped_count'  => $log['skipped_count'] ?? 0,

			'request_url'    => $log['request_url'] ?? null,
			'note'           => $log['note'] ?? null,
		];

		$this->db->insert('tender_notice_fetch_logs', $row);
	}

	private function normalizeValue($v) {
		if (is_array($v)) {
			if (empty($v)) return null;
			// 리스트 배열인지(키가 0..n 연속) 판별
			$isList = true; $i = 0;
			foreach (array_keys($v) as $k) { if ($k !== $i++) { $isList = false; break; } }
			if ($isList) {
				// 스칼라만 뽑아 콤마로 합침
				$flat = array_filter($v, 'is_scalar');
				return empty($flat) ? null : implode(',', $flat);
			} else {
				return json_encode($v, JSON_UNESCAPED_UNICODE);
			}
		}
		if ($v === '' || $v === 'Array') return null; // 방어
		return $v;
	}

	/** 개별 키 꺼내며 normalize */
	private function v(array $arr, string $key) {
		return isset($arr[$key]) ? $this->normalizeValue($arr[$key]) : null;
	}
}