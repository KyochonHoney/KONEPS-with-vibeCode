<!DOCTYPE html>
<html lang="kr" dir="ltr" class="light">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta http-equiv="X-UA-Compatible" content="ie=edge">
		<link rel="shortcut icon" href="/assets/img/favicon.ico">
		<title><?= $this->config->item('site_code') ?></title>

		<!-- Core CSS -->
		<link rel="stylesheet" type="text/css" href="/assets/css/style.css?ver=<?php echo time()?>">
		<link rel="stylesheet" type="text/css" href="/assets/css/layout.css?ver=<?php echo time()?>">
		<!-- Core Vendors JS -->
		<script src="/assets/js/vendors.min.js"></script>
		<!-- Other Vendors JS -->
        <script src="/assets/vendors/apexcharts/apexcharts.js"></script>
		<script src="/assets/vendors/fullcalendar/dist/index.global.js"></script>
		<!-- <script src="/vendors/fullcalendar/dist/popper.min.js"></script>
		<script src="/vendors/fullcalendar/dist/tooltip.min.js"></script> -->
		<!-- Page js -->
        
		<!-- Core JS -->
		<script src="/assets/js/app.min.js"></script>
		
		<!-- Page js -->
		<script src="/assets/js/jquery.blockUI.js"></script>
		<script src="/assets/js/common.js?ver=<?php echo date("YmdHis"); ?>"></script>
		<script src="/assets/js/form.js?ver=<?php echo date("YmdHis"); ?>"></script>	
		
	</head>
	<body>
	<div id="notification-toast" class="toast-wrapper top-end"></div>