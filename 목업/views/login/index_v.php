<!-- App Start-->
<div id="root">
    <!-- App Layout-->
    <div class="app-layout-blank flex flex-auto flex-col h-[100vh]">
        <main class="h-full">
            <div class="page-container relative h-full flex flex-auto flex-col">
                <div class="h-full">
                    <div class="container mx-auto flex flex-col flex-auto items-center justify-center min-w-0 h-full">
                        <div class="card min-w-[320px] md:min-w-[450px] card-shadow" role="presentation">
                            <div class="card-body md:p-10">
                                <div class="text-center">
                                    <div class="logo">나라장터 공고리스트
                                        <!--img class="login-logo mb-5" src="/assets/admin/img/logo/logo_symbol.png" alt=""-->
                                    </div>
                                </div>
                                <div class="text-center">
                                    <div>
                                        <form id="loginForm">
                                            <div class="form-container vertical">
                                                <div class="form-item vertical">
                                                    <label class="form-label mb-2">아이디</label>
                                                    <div>
                                                        <input class="input" type="text" id="ID" name="ID" autocomplete="off" placeholder="아이디" value="">
                                                    </div>
                                                </div>
                                                <div class="form-item vertical mb-10">
                                                    <label class="form-label mb-2">비밀번호</label>
                                                    <div>
                                                        <span class="input-wrapper">
                                                            <input class="input pr-8" type="password" id="PW" name="PW" autocomplete="off" placeholder="비밀번호" value="">
                                                        </span>
                                                    </div>
                                                </div>
                                                <button class="btn btn-solid w-full" type="submit">로그인</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>                
    </div>
</div>