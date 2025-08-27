<div class="h-full flex flex-auto flex-col justify-between">
	<!-- Content start -->
	<main class="h-full">
		<div class="page-container relative h-full flex flex-auto flex-col px-4 sm:px-6 md:px-8 py-6 sm:py-6">
			<div class="container mx-auto">
				<div class="flex items-center justify-between mb-4">
					<h3>공고 상세보기</h3>
					<a href="<?= $list->bidNtceDtlUrl ?>" target="_blank" rel="noopener noreferrer">
						<button class="btn btn-sm btn-solid" type="button">나라장터 바로가기</button>
					</a>
				</div>
				<div class="card adaptable-card">
					<div class="card-body p-relative">
						<form id="filesForm">
							<div class="form-container vertical">
								<div class="grid md:grid-cols-3 gap-4 py-6 border-b border-gray-200 dark:border-gray-600 items-center">
									<div class="font-semibold">입찰공고번호 <font color="red">*</font></div>
									<div class="col-span-2">
										<?= $list->bidNtceNo ?>
									</div>
								</div>
								<div class="grid md:grid-cols-3 gap-4 py-6 border-b border-gray-200 dark:border-gray-600 items-center">
									<div class="font-semibold">공고종류명 <font color="red">*</font></div>
									<div class="col-span-2">
										<?php
											echo ($list->ntceKindNm == "재공고") ? "<font color='red'>{$list->ntceKindNm}</font>" :
												(($list->ntceKindNm == "변경공고") ? "<font color='green'>{$list->ntceKindNm}</font>" : $list->ntceKindNm);
										?>	
									</div>
								</div>
								<div class="grid md:grid-cols-3 gap-4 py-6 border-b border-gray-200 dark:border-gray-600 items-center">
									<div class="font-semibold">입찰공고명 <font color="red">*</font></div>
									<div class="col-span-2">
										<?= $list->bidNtceNm ?>
									</div>
								</div>
								<div class="grid md:grid-cols-3 gap-4 py-6 border-b border-gray-200 dark:border-gray-600 items-center">
									<div class="font-semibold">수요기관명 <font color="red">*</font></div>
									<div class="col-span-2">
										<?= $list->dminsttNm ?>
									</div>
								</div>
                                <div class="grid md:grid-cols-3 gap-4 py-6 border-b border-gray-200 dark:border-gray-600 items-center">
									<div class="font-semibold">입찰방식명</div>
									<div class="col-span-2">
										<?= $list->bidMethdNm ?>
									</div>
								</div>
                                <div class="grid md:grid-cols-3 gap-4 py-6 border-b border-gray-200 dark:border-gray-600 items-center">
									<div class="font-semibold">계약체결방법명</div>
									<div class="col-span-2">
										<?= $list->cntrctCnclsMthdNm ?>
									</div>
								</div>
                                <div class="grid md:grid-cols-3 gap-4 py-6 border-b border-gray-200 dark:border-gray-600 items-center">
									<div class="font-semibold">입찰개시일시 ~ 입찰개시일시</div>
									<div class="col-span-2">
										<?= $list->bidBeginDt . " - " . ($list->bidEndDt ?? "") ?>
									</div>
								</div>
								<div class="grid md:grid-cols-3 gap-4 py-6 border-b border-gray-200 dark:border-gray-600 items-center">
									<div class="font-semibold">예정가격결정방법명</div>
									<div class="col-span-2">
										<?= $list->prearngPrceDcsnMthdNm ?>
									</div>
								</div>
								<div class="grid md:grid-cols-3 gap-4 py-6 border-b border-gray-200 dark:border-gray-600 items-center">
									<div class="font-semibold">총예가건수</div>
									<div class="col-span-2">
										<?= number_format($list->totPrdprcNum) ?>
									</div>
								</div>
								<div class="grid md:grid-cols-3 gap-4 py-6 border-b border-gray-200 dark:border-gray-600 items-center">
									<div class="font-semibold">추첨예가건수</div>
									<div class="col-span-2">
										<?= number_format($list->drwtPrdprcNum) ?>
									</div>
								</div>
								<div class="grid md:grid-cols-3 gap-4 py-6 border-b border-gray-200 dark:border-gray-600 items-center">
									<div class="font-semibold">배정예산금액</div>
									<div class="col-span-2">
										<?= number_format($list->asignBdgtAmt) ?>
									</div>
								</div>
								<div class="grid md:grid-cols-3 gap-4 py-6 border-b border-gray-200 dark:border-gray-600 items-center">
									<div class="font-semibold">추정가격</div>
									<div class="col-span-2">
										<?= number_format($list->presmptPrce) ?>
									</div>
								</div>
								<div class="grid md:grid-cols-3 gap-4 py-6 border-b border-gray-200 dark:border-gray-600 items-center">
									<div class="font-semibold">개찰장소</div>
									<div class="col-span-2">
										<?= $list->opengPlce ?>
									</div>
								</div>
								<div class="grid md:grid-cols-3 gap-4 py-6 border-b border-gray-200 dark:border-gray-600 items-center">
									<div class="font-semibold">설명회실시일시 & 설명회실시장소</div>
									<div class="col-span-2">
										<?= $list->dcmtgOprtnDt ?><br/>
										<?= $list->dcmtgOprtnPlce ?>
									</div>
								</div>
								<div class="grid md:grid-cols-3 gap-4 py-6 border-b border-gray-200 dark:border-gray-600 items-center">
									<div class="font-semibold">낙찰하한율</div>
									<div class="col-span-2">
										<?= $list->sucsfbidLwltRate ?>
									</div>
								</div>
								<div class="grid md:grid-cols-3 gap-4 py-6 border-b border-gray-200 dark:border-gray-600 items-center">
									<div class="font-semibold">낙찰방법명</div>
									<div class="col-span-2">
										<?= $list->sucsfbidMthdNm ?>
									</div>
								</div>
								<div class="grid md:grid-cols-3 gap-4 py-6 border-b border-gray-200 dark:border-gray-600 items-center">
									<div class="font-semibold">수요기관담당자이메일주소</div>
									<div class="col-span-2">
										<?= $list->dminsttOfclEmailAdrs ?>
									</div>
								</div>
								<div class="grid md:grid-cols-3 gap-4 py-6 border-b border-gray-200 dark:border-gray-600 items-center">
									<div class="font-semibold">변경공고사유</div>
									<div class="col-span-2">
										<?= $list->chgNtceRsn ?>
									</div>
								</div>
                                <div class="grid md:grid-cols-3 gap-4 py-6 border-b border-gray-200 dark:border-gray-600 items-center">
									<div class="font-semibold">공고규격서</div>
									<div class="col-span-2">
										<?php 
											for($i = 1; $i <=10; $i++) {
												if($list->{"ntceSpecDocUrl{$i}"}) {
													echo "<a href=\"{$list->{"ntceSpecDocUrl{$i}"}}\" target=\"_blank\"><font color='blue'>{$list->{"ntceSpecFileNm{$i}"}}</font></a><br/>";
												}
											}
											?>
											<?php // if($list->stdNtceDocUrl) { ?>
												<!--a href="<?= $list->stdNtceDocUrl ?>" target="_blank">표준공고서</a-->
											<?php //} ?>
									</div>
								</div>
							</div>
							
							<div class="mt-4 flex ltr:justify-end gap-2">
								<button class="btn btn-sm btn-default" type="button" onclick="history.back();">나가기</button>
							</div>
						</form>
					</div>
				</div>
			</div>    
		</div>
	</main>
	<!-- Content end -->