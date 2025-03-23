import { ActivatedRoute, Router } from "@angular/router";
import { Component, Renderer2, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { InputType } from "@app/shared/enums/InputType";
import { AuthService } from "@app/shared/services/auth.service";
import { PreviousRouteService } from "@app/shared/services/previous-route.service";
import { CommonService } from "@app/shared/services/common.service";
import { environment } from "@app/environments/environment";

declare global {
	interface Window {
		PasswordCredential: any;
		FederatedCredential: any;
	}
}

enum ModalType {
	login,
	forgotPassword,
	changePassword,
}

@Component({
	selector: "app-login-page",
	templateUrl: "./login-page.component.html",
	styleUrl: "./login-page.component.css",
})
export class LoginPageComponent {
	isDialogOpen: boolean = true;
	isMachineBoardLogin: boolean = false;
	isShowPassword: boolean = false;
	passwordType: InputType = InputType.PASSWORD;
	@ViewChild("loginForm") loginForm?: NgForm;
	@ViewChild("errorDialog", { static: false }) errorDialog: any;
	@ViewChild("successDialog", { static: false }) successDialog: any;
	errorMessage: string = "";
	isLoading: boolean = false;
	lastVisitedRoute: string = "";
	token: string = "";
	dialogTypeEnum = ModalType;
	dialogType = this.dialogTypeEnum.login;
	dialogTitle: string = $localize`Sign In`;
	errorMessageForResponse = $localize`Unauthorized.`;
	successMessageForResponse = "";
	username: string = "";
	password: string = "";
	public logoSrc: string = '';
	public companyLogo: string = environment.homeLogo;
	public isCustomLogo: boolean = environment.isHomeLogoCustom == 1 ? true : false;

	passwordStyles = {
		passwordInputType: InputType.PASSWORD,
		isShowPassword: false,
		newPasswordInputType: InputType.PASSWORD,
		isShowNewPassword: false,
		confirmPasswordInputType: InputType.PASSWORD,
		isShowConfirmPassword: false,
	};

	constructor(
		private authService: AuthService,
		private router: Router,
		private route: ActivatedRoute,
		private renderer: Renderer2,
		private previousRouteService: PreviousRouteService,
		private _commonService: CommonService
	) {}

	ngOnInit(): void {
		const url = this.router.url || "";

		if(!this.isCustomLogo) {
			if(this.companyLogo == 'schertech') this.logoSrc = './assets/images/schertech-logo.png';
			else if(this.companyLogo == 'derga') this.logoSrc = './assets/images/derga_logo.png';
		} else this.logoSrc = '';

		if (!url.includes("machine-board")) {
			this.checkLogin();
		}

		this.dialogType = ModalType.login;

		switch (true) {
			case url.includes("forgot-password"):
				this.dialogType = this.dialogTypeEnum.forgotPassword;
				this.dialogTitle = $localize`Forgot my password`;
				break;
			case url.includes("change-password"):
				this.dialogType = this.dialogTypeEnum.changePassword;
				this.dialogTitle = $localize`Change Password`;
				this.validateToken();
				break;
			default:
				this.prefillLoginData();
				this.dialogType = this.dialogTypeEnum.login;
				this.dialogTitle = $localize`Sign In`;
				this.checkRoute();
		}
	}

	validateToken() {
		this.token = this.route.snapshot.params["token"];

		this._commonService
			.post("check-token-validation-for-reset-password", { token: this.token }, false)
			.subscribe({
				next: res => {
					this.isLoading = false;
				},
				error: (e: any) => {
					this.isLoading = false;
					this.errorMessageForResponse = $localize`Token is not valid!`;
					this.errorDialog.elementRef.nativeElement.open = true;
				},
			});
	}

	onClickPassword(clickedFrom = "password") {
		switch (clickedFrom) {
			case "password":
				this.passwordStyles.isShowPassword = !this.passwordStyles.isShowPassword;
				this.passwordStyles.isShowPassword
					? (this.passwordStyles.passwordInputType = InputType.TEXT)
					: (this.passwordStyles.passwordInputType = InputType.PASSWORD);
				break;
			case "newPassword":
				this.passwordStyles.isShowNewPassword = !this.passwordStyles.isShowNewPassword;
				this.passwordStyles.isShowNewPassword
					? (this.passwordStyles.newPasswordInputType = InputType.TEXT)
					: (this.passwordStyles.newPasswordInputType = InputType.PASSWORD);
				break;
			case "confirmPassword":
				this.passwordStyles.isShowConfirmPassword =
					!this.passwordStyles.isShowConfirmPassword;
				this.passwordStyles.isShowConfirmPassword
					? (this.passwordStyles.confirmPasswordInputType = InputType.TEXT)
					: (this.passwordStyles.confirmPasswordInputType = InputType.PASSWORD);
				break;

			default:
				break;
		}
	}

	onSubmit(form: NgForm) {
		this.errorMessage = "";
		if (!form.valid) {
			switch (true) {
				case this.dialogType == this.dialogTypeEnum.forgotPassword:
					this.errorMessage = $localize`Please enter the email address`;
					break;
				case this.dialogType == this.dialogTypeEnum.changePassword:
					this.errorMessage = $localize`Current Password and Confirm Password must match`;
					break;
				default:
					this.dialogType = this.dialogTypeEnum.login;
					this.errorMessage = $localize`Please enter the username and password`;
			}
			return;
		}

		switch (true) {
			case this.dialogType == this.dialogTypeEnum.forgotPassword:
				this.forgotPassword(form);
				break;
			case this.dialogType == this.dialogTypeEnum.changePassword:
				this.resetPassword(form);
				break;
			default:
				this.logIn(form);
		}
	}

	resetPassword(form: NgForm) {
		const password = form.value.newPassword;
		const passwordConfirm = form.value.confirmPassword;

		if (!password || password !== passwordConfirm) {
			this.errorMessage = $localize`New Password and Confirm Password must match`;

			return;
		}

		this._commonService
			.post("reset-password", { password, passwordConfirm, token: this.token }, false)
			.subscribe({
				next: res => {
					console.log(res);
					this.isLoading = false;
					this.successMessageForResponse = $localize`Password reset successfully!`;
					this.successDialog.elementRef.nativeElement.open = true;
				},
				error: (e: any) => {
					this.isLoading = false;
					this.errorMessageForResponse = $localize`User not found!`;
					this.errorDialog.elementRef.nativeElement.open = true;
				},
			});
	}

	forgotPassword(form: NgForm) {
		const email = form.value.email;
		this.isLoading = true;

		this._commonService
			.post("forget-password", { email, url: window.location.href }, false)
			.subscribe({
				next: res => {
					console.log(res);
					this.isLoading = false;
					this.successMessageForResponse = $localize`Please check your inbox for the password reset link.`;
					this.successDialog.elementRef.nativeElement.open = true;
				},
				error: (e: any) => {
					this.isLoading = false;
					this.errorMessageForResponse = $localize`User not found!`;
					this.errorDialog.elementRef.nativeElement.open = true;
				},
			});
	}

	logIn(form: NgForm) {
		this.errorMessage = "";
		this.isLoading = true;

		this.authService.login(form.value.username, form.value.password).then(
			data => {
				this.errorMessage = data as string;
				this.isLoading = false;

				// auto saving chrome
				if (window.PasswordCredential) {
					var c = new window.PasswordCredential({
						password: form.value.password,
						id: form.value.username,
					});
					navigator.credentials.store(c);
				}

				if (
					this.router.url.split("/")[1] &&
					this.router.url.split("/")[1] == "machine-board"
				) {
					this.router.navigate(["../"], { relativeTo: this.route }).then(() => {
						window.location.reload();
					});
				} else {
					this.router.navigate(["/"], { replaceUrl: true });
				}
			},
			err => {
				this.errorMessage = err as string;
				this.isLoading = false;
			}
		);
	}

	changeInput(event: any) {
		if (event.key == "Enter") {
			(this.loginForm as any).onSubmit(undefined);
		}
	}

	onClickLoginButton() {
		(this.loginForm as any).onSubmit(undefined);
	}

	closeDialog() {
		this.isDialogOpen = false;
		this.router.navigate(["../"], { relativeTo: this.route }).catch(() => {
			this.router.navigate(["../../"], { relativeTo: this.route });
			this.renderer.removeClass(document.body, "sapUiSizeCompact");
			this.renderer.addClass(document.body, "sapUiSizeCozy");
		});
	}

	checkLogin() {
		const token = this.authService.getToken() || "";
		if (token) {
			this.router.navigate(["/"], { replaceUrl: true });
		}
	}

	checkRoute() {
		this.lastVisitedRoute = this.previousRouteService.getPreviousUrl() || "";
		const url = window.location.href;
		const index = url.split("/");

		if (index.includes("machine-board") && index.length >= 6) {
			this.isMachineBoardLogin = true;
			this.renderer.addClass(document.body, "sapUiSizeCompact");
			this.renderer.removeClass(document.body, "sapUiSizeCozy");
		} else {
			// That means user reload the page and after that check the auto login
			if (this.lastVisitedRoute == "/login") {
				try {
					this.authService
						.autoLogin()
						.then(response => {
							const machineID = response;

							if (machineID) {
								this.router.navigate([`/machine-board/${machineID}`], {
									relativeTo: this.route,
								});
							} else if (index.includes("machine-board")) {
								this.router.navigate(["/"], { replaceUrl: true });
							}
						})
						.catch(error => {
							console.log(error);
						});
				} catch (error) {
					console.log(error);
				}
			}
		}
	}

	onTerminalLogin(isUnAuthShow = true) {
		this.authService.autoLogin().then(response => {
			const machineID = response;

			if (machineID) this.router.navigate(["../"], { relativeTo: this.route });
			else if (isUnAuthShow) {
				this.errorDialog.elementRef.nativeElement.open = true;
			}
		});
	}

	closeErrorDialog() {
		this.errorDialog.elementRef.nativeElement.open = false;

		if (this.dialogType == this.dialogTypeEnum.changePassword) {
			this.router.navigate(["/login"], { replaceUrl: true });
		}
	}

	closeSuccessDialog() {
		this.successDialog.elementRef.nativeElement.open = false;
		this.successMessageForResponse = "";

		this.router.navigate(["/login"], { replaceUrl: true });
	}

	prefillLoginData() {
		this.username = this.route.snapshot.queryParams["username"]
			? this.route.snapshot.queryParams["username"]
			: "";
		this.password = this.route.snapshot.queryParams["password"]
			? this.route.snapshot.queryParams["password"]
			: "";
	}
}
