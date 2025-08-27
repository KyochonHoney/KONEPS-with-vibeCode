<?php
defined('BASEPATH') OR exit('No direct script access allowed');
class Login extends CI_Controller {
	function __construct()
	{
		parent::__construct();		
		header('X-Content-Type-Options: nosniff');
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
				$this->load->view("header_sub_v");
				$this->{"{$method}"}();
				$this->load->view("footer_sub_v");
			} else {
				$this->load->view("errors/html/error_404");
			}
		}
	}

    public function index()
    {
        $this->load->view(strtolower(__CLASS__).'/'.__FUNCTION__.'_v', @$data);
    }
}