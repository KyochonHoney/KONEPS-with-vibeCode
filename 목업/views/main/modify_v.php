<div class="h-full flex flex-auto flex-col justify-between">
	<!-- Content start -->
	<main class="h-full">
		<div class="page-container relative h-full flex flex-auto flex-col px-4 sm:px-6 md:px-8 py-6 sm:py-6">
			<div class="container mx-auto">
				<div class="flex items-center justify-between mb-4">
					<h3>공고 등록</h3>
				</div>
				<div class="card adaptable-card">
					<div class="card-body p-relative">
						<form id="tenderNoticeForm">
							<div class="form-container vertical">
                                <div class="grid md:grid-cols-3 gap-4 py-6 border-b border-gray-200 dark:border-gray-600 items-center">
									<div class="font-semibold">공고번호</div>
									<div class="col-span-2">
										<input type="text" class="input input-sm" placeholder="공고번호를 써주세요." name="bidNtceNo" id="bidNtceNo" value="">
									</div>
								</div>
							</div>
							
							<div class="mt-4 flex ltr:justify-end gap-2">
								<button class="btn btn-sm btn-default" type="button" onclick="history.back();">취소</button>
								<button class="btn btn-sm btn-solid" type="submit">저장</button>
							</div>
						</form>
					</div>
				</div>
			</div>    
		</div>
	</main>
	<!-- Content end -->