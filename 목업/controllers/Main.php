<?php
defined('BASEPATH') OR exit('No direct script access allowed');
class Main extends CI_Controller {
	function __construct()
	{
		parent::__construct();		
		header('X-Content-Type-Options: nosniff');	
		if(!$this->session->userdata('logged_in')) {
			replace("/login");
			exit;
		}
	}
	public function _remap($method) {
		if ($this->input->is_ajax_request()) {
			if (method_exists($this, $method)) {
				$this->{"{$method}"}();
			} else {
				$this->load->view("errors/html/error_404");
			}
		} else {
			if (method_exists($this, $method)) {
				$this->load->view("header_v");
				$this->{"{$method}"}();
				$this->load->view("footer_v");
			} else {
				$this->load->view("errors/html/error_404");
			}
		}
	}

    public function index()
    {
		$where = "";
        if (isset($_GET['search']) && $_GET['search']) {
            $where .= " AND (`bidNtceNo` LIKE '%".$_GET['search']."%' OR `bidNtceNm` LIKE '%".$_GET['search']."%' OR `dminsttNm` LIKE '%".$_GET['search']."%')";
        }
		$data['offset'] = $offset = $this->input->get('offset') ?? 50;
		$this->load->library('pagination');	
		$page = $this->uri->segment(3);
        if(!$page) { $page = 1; }    
		$data['table'] = $table = "tender_notices";
		$field = "*";
		$config['base_url'] = base_url().$this->uri->segment(1).'/index';   			
		$data['total_rows'] = $config['total_rows'] = $this->Global_m->JOIN_GET_LIST($table, $field, $where, $page, $offset, 'id', 'count');
		$data['Number'] = $config['total_rows'] - ($offset * ($page - 1));		
		$config['reuse_query_string'] = TRUE;
		$config['per_page'] = $offset;	
        $config['first_link'] = FALSE; 
		$config['last_link'] = FALSE; 
		$config['use_page_numbers'] = TRUE; 
		$this->pagination->initialize($config);
		$data['menu'] = strtolower(__CLASS__);
		
		$data['list'] = $this->Global_m->JOIN_GET_LIST($table, $field, $where, $page, $offset, 'id', '', 'desc');
        
		$this->load->view(strtolower(__CLASS__).'/'.__FUNCTION__.'_v', @$data);
    }

    public function detail()
    {
		$data['idx'] = $this->uri->segment(3) ?? '';
		if($data['idx']) {
			$data['list'] = $this->Global_m->GET_ROW('tender_notices', array('id'=>$data['idx']));
		} else {
			alert('잘못된 접근입니다.', '/');
		}
        $this->load->view(strtolower(__CLASS__).'/'.__FUNCTION__.'_v', @$data);
    }

	public function modify()
	{
		$this->load->view(strtolower(__CLASS__).'/'.__FUNCTION__.'_v', @$data);
	}
}