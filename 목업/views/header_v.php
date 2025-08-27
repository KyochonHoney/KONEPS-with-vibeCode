<!DOCTYPE html>
<html lang="kr" dir="ltr" class="light">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta http-equiv="X-UA-Compatible" content="ie=edge">
		<!--link rel="shortcut icon" href="img/favicon.ico"-->
		<title><?= $this->config->item('site_code') ?></title>

		<!-- Core CSS -->
		<link rel="stylesheet" type="text/css" href="/assets/css/style.css?ver=<?php echo time()?>">
		<link rel="stylesheet" type="text/css" href="/assets/css/layout.css?ver=<?php echo time()?>">
		<!-- Core Vendors JS -->
		<script src="/assets/js/vendors.min.js"></script>
		<!-- Other Vendors JS -->
        <script src="/assets/vendors/apexcharts/apexcharts.js"></script>
		<script src="/assets/vendors/fullcalendar/dist/index.global.js"></script>
		<!-- Core JS -->
		<script src="/assets/js/app.min.js"></script>
		<script src="/assets/vendors/datatables/jquery.dataTables.min.js"></script>
        <script src="/assets/vendors/datatables/dataTables.custom-ui.min.js"></script>
		<!-- Page js -->
        <script src="/assets/js/pages/table-demo.js"></script>
		<script src="/assets/js/jquery.blockUI.js"></script>
		<script src="/assets/js/common.js?ver=<?php echo date("YmdHis"); ?>"></script>
		<script src="/assets/js/form.js?ver=<?php echo date("YmdHis"); ?>"></script>	
		<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/sweetalert/1.1.3/sweetalert.min.js"></script>
		<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/sweetalert/1.1.3/sweetalert.min.css">
		
	</head>
	<body>
		<!-- App Start-->
		<div id="root">
			<!-- App Layout-->
			<div class="app-layout-modern flex flex-auto flex-col">
				<div class="flex flex-auto min-w-0">
					<!-- Side Nav start-->
					<div class="side-nav side-nav-transparent side-nav-expand">
						<div class="side-nav-header py-8">
							<div class="logo logo-pd">
								<a href="/">
									<h2>  Tideflo </h2><br/> <h3>나라장터 공고</h3>
								</a>
							</div>
						</div>
						<div class="side-nav-content relative side-nav-scroll">
							<nav class="menu menu-transparent px-4 pb-4">
								<div class="menu-group">
									<ul>
										<li class="menu-collapse" onclick="location.href='/'">
											<div class="menu-collapse-item content-none <?php if(isset($menu) && $menu == 'main') { echo "menu-item-active"; } ?>">
												<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" class="w-6 h-6">
													<path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"></path>
												</svg>
												<span class="menu-item-text">공고 관리</span>
											</div>
										</li>
									</ul>
								</div>
							</nav>	
						</div>
					</div>
					<!-- Side Nav end-->

					<!-- Header Nav start-->
					<div class="flex flex-col flex-auto min-h-screen min-w-0 relative w-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
						<header class="header border-b border-gray-200 dark:border-gray-700">
							<div class="header-wrapper h-16">
								<!-- Header Nav Start start-->
								<div class="header-action header-action-start">
									<div id="side-nav-toggle" class="side-nav-toggle header-action-item header-action-item-hoverable">
										<div class="text-2xl">
											<svg class="side-nav-toggle-icon-expand" stroke="currentColor" fill="none" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path>
											</svg>
											<svg class="side-nav-toggle-icon-collapsed hidden" stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
												<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
											</svg>
										</div>
									</div>
									<div class="side-nav-toggle-mobile header-action-item header-action-item-hoverable" data-bs-toggle="modal" data-bs-target="#mobile-nav-drawer">
										<div class="text-2xl">
											<svg stroke="currentColor" fill="none" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path>
											</svg>
										</div>
									</div>
									<div class="text-2xl header-action-item header-action-item-hoverable">
										<a href="/">
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" class="w-6 h-6">
												<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"></path>
											</svg>
										</a>
									</div>
								</div>
								<!-- Header Nav Start end-->
								<!-- Header Nav End start -->
								<div class="header-action header-action-end">
									<!-- User Dropdown-->
									<div class="dropdown">
										<div class="dropdown-toggle" id="user-dropdown" data-bs-toggle="dropdown">
											<div class="header-action-item flex items-center gap-2">
												<span class="avatar avatar-circle avatar-md mr-1">
													<span class="avatar-icon avatar-icon-md">
														<svg stroke="currentColor" fill="none" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
															<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
														</svg>
													</span>
												</span>
												<div class="hidden md:block">
													<div class="font-bold">최고관리자</div>
													<div class="text-xs"><?php echo $this->session->userdata('USER_CODE'); ?></div>
												</div>
											</div>
										</div>
										<ul class="dropdown-menu bottom-end min-w-[240px]">
											<li class="menu-item-header">
												<div class="py-2 px-3 flex items-center gap-2">
													<span class="avatar avatar-circle avatar-md mr-1">
														<span class="avatar-icon avatar-icon-md">
															<svg stroke="currentColor" fill="none" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
																<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
															</svg>
														</span>
													</span>
													<div>
														<div class="font-bold text-gray-900 dark:text-gray-100">최고관리자</div>
														<div class="text-xs"><?php echo $this->session->userdata('USER_CODE'); ?></div>
													</div>
												</div>
											</li>
											<!--li class="menu-item-divider"></li-->
											<!--li class="menu-item menu-item-hoverable mb-1 h-[35px]">
												<a class="flex gap-2 items-center" href="/proc/member_modify/<?php echo $this->session->userdata('USER_CODE'); ?>">
													<span class="text-xl opacity-50">
														<svg stroke="currentColor" fill="none" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
															<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
															<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
														</svg>
													</span>
													<span>내 정보 수정</span>
												</a>
											</li-->
											<li id="menu-item-29-2VewETdxAb" class="menu-item-divider"></li>
											<li class="menu-item menu-item-hoverable gap-2 h-[35px]" onclick="location.href='/proc/logout'">
												<span class="text-xl opacity-50">
													<svg stroke="currentColor" fill="none" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
													</svg>
												</span>
												<span>로그아웃</span>
											</li>
										</ul>
									</div>
								</div>
								<!-- Header Nav End end -->
							</div>
						</header>
						<!-- Popup start -->
						<div class="modal fade" id="mobile-nav-drawer" tabindex="-1" aria-hidden="true">
							<div class="modal-dialog drawer drawer-start !w-[330px]">
								<div class="drawer-content">
									<div class="drawer-header">
										<h5><?= $this->config->item('site_code') ?></h5>
										<span class="close-btn" role="button" data-bs-dismiss="modal">
											<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 20 20" aria-hidden="true" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
												<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
											</svg>
										</span>
									</div>
									<div class="drawer-body p-0">
										<div class="side-nav-mobile">
											<div class="side-nav-content relative side-nav-scroll">
												<nav class="menu menu-transparent px-4 py-4">
													<div class="menu-group">
														<ul>
															<li class="menu-collapse" onclick="location.href='/'">
																<div class="menu-collapse-item content-none <?php if(isset($menu) && $menu == 'main') { echo "menu-item-active"; } ?>">
																	<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" class="w-6 h-6">
																		<path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"></path>
																	</svg>
																	<span class="menu-item-text">공고 관리</span>
																</div>
															</li>
															
														</ul>
													</div>
												</nav>	
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<!-- Popup end -->
						