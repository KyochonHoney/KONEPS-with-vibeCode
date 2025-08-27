<div class="h-full flex flex-auto flex-col justify-between">
<!-- Content start -->
<main class="h-full">
	<div class="page-container relative h-full flex flex-auto flex-col px-4 sm:px-6 md:px-8 py-4 sm:py-6">
		<div class="flex flex-col gap-4 h-full">
			<div class="lg:flex items-center justify-between mb-4 gap-3">
				<div class="mb-4 lg:mb-0">
					<h3>입찰공고 관리</h3>
				</div>
			</div>
			<div class="card adaptable-card">
				<div class="card-body">
					<div class="flex flex-wrap items-center gap-2 mb-5 justify-between">
					<form id='searchForm' action='/main/index?>' method='get' class="form-horizontal" role="form">
						<div class="flex items-center gap-1 w-100">
							<select name="offset" class="select select-sm">
								<option value="50" <?= $offset=="50" ? "selected" : "" ?>>50개 씩 보기</option>
								<option value="100" <?= $offset=="100" ? "selected" : "" ?>>100개 씩 보기</option>
								<option value="200" <?= $offset=="200" ? "selected" : "" ?>>200개 씩 보기</option>
							</select>
							<input class="input input-sm" name="search" type="text" placeholder="공고번호 or 사업명 or 기관명 검색" style="width: 300px;">
							<button type="submit" class="btn btn-sm btn-solid w-100">검색</button>
						</div>
					</form>
						<div class="flex items-center gap-1 w-100">
							<!--a href="" class="btn btn-sm btn-default items-center flex  w-100 deleteAll" data-table="file_list">삭제</a-->
							<!--a href="/main/modify" class="btn btn-sm btn-solid items-center flex  w-100">등록</a-->
						</div>
					</div>
					<div class="table-box mt-2 mb-10">
						<table id="" class="table-default table-hover">
							<thead>
								<tr>
									<th><input class="checkbox" id="checkAll" type="checkbox" value="true"></th>
									<th>번호</th>
									<th>공고종류</th>
									<th>지역제한</th>
									<th>공고번호</th>
									<th>사업명</th>
									<th>기관명</th>
									<th>사업금액</th>
									<th>입찰방식</th>
									<th>입찰기한</th>
									<th>등록일</th>
									<th>관리</th>
								</tr>
								<tbody>
									<?php if($list) { ?>
										<?php foreach($list as $val) { ?>
											<tr>
												<td><input id="chk_<?= $val->id; ?>" class="checkbox chk" name="chk" type="checkbox" value="<?= $val->id; ?>"></td>
												<td><?php echo $Number--; ?></td>
												<td>
													<?php
													echo ($val->ntceKindNm == "재공고") ? "<font color='red'>{$val->ntceKindNm}</font>" :
														(($val->ntceKindNm == "변경공고") ? "<font color='green'>{$val->ntceKindNm}</font>" : $val->ntceKindNm);
													?>	
												</td>
												<td><?php echo $val->prtcptLmtRgnCd; ?></td>
												<td><?php echo $val->bidNtceNo; ?></td>
												<td><?php echo $val->bidNtceNm; ?></td>
												<td><?php echo $val->dminsttNm; ?></td>
												<td><?php echo number_format($val->asignBdgtAmt); ?></td>
												<td><?php echo $val->bidMethdNm; ?></td>
												<td><?php echo $val->bidClseDt; ?></td>
												<td><?php echo date('Y-m-d', strtotime($val->created_at)); ?></td>
												<td>
													<a href="<?php echo $val->bidNtceDtlUrl; ?>" target="_blank">나라장터 이동</a>
													/
													<a href="/main/detail/<?php echo $val->id; ?>">보기</a>
												</td>
											</tr>
										<?php } ?>
									<?php } else { ?>
										<tr>
											<td colspan="11">등록된 파일이 없습니다.</td>
										</tr>
									<?php } ?>
								</tbody>
							</thead>
						</table>
					</div>
					
					<ul class="pagination">
						<?php echo $this->pagination->create_links(); ?>
					</ul>
				</div>
			</div>
		</div>  
	</div>
</main>
<!-- Content end -->