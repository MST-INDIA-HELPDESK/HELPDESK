import { BrowserModule, Title } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { NgModule,ModuleWithProviders } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './helpers/jwt.interceptor';
import { FilterPipe }from './pipes/filter.pipe';
import { TruncatePipe }from './pipes/truncate.pipe';
import { MyDatePickerModule } from 'mydatepicker';
import { NgxPaginationModule} from 'ngx-pagination';
import { SocialLoginModule,AuthServiceConfig, GoogleLoginProvider, FacebookLoginProvider} from "angular-6-social-login";
import { HomeComponent } from './home/home.component';
import { TopicsComponent } from './topics/topics.component';
import { TopicFormComponent } from './topic-form/topic-form.component';
import { KnowledgeBaseComponent } from './knowledge-base/knowledge-base.component';
import { TicketsComponent } from './tickets/tickets.component';
import { SettingsComponent } from './settings/settings.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ProfileComponent } from './profile/profile.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { TeamsComponent } from './teams/teams.component';
import { TicketDetailComponent } from './ticket-detail/ticket-detail.component';
import { UpdateteamComponent } from './updateteam/updateteam.component';
import { ManageknowledgebaseComponent } from './manageknowledgebase/manageknowledgebase.component';
import { UserHeaderComponent } from './user-header/user-header.component';
import { UserFooterComponent } from './user-footer/user-footer.component';
import { UserComponent } from './user/user.component';
import { CategoryknowledgebaseComponent } from './categoryknowledgebase/categoryknowledgebase.component';
import { ArticleknowledgebaseComponent } from './articleknowledgebase/articleknowledgebase.component';
import { ShowsubcategoriesComponent } from './showsubcategories/showsubcategories.component';
import { ViewticketComponent } from './viewticket/viewticket.component';
import { TimeDiffPipe } from './pipes/timeDiff.pipe';
import { RegisterComponent } from './register/register.component';
import { ForgetpasswordComponent } from './forgetpassword/forgetpassword.component';
import { CannedComponent } from './canned/canned.component';
//import { NgxEditorModule } from 'ngx-editor';
import { Angular2FontawesomeModule } from 'angular2-fontawesome/angular2-fontawesome';
import { ReportsComponent } from './reports/reports.component';
import {NgPipesModule} from 'ngx-pipes';
import { GeneralsettingsComponent } from './generalsettings/generalsettings.component';
import { HelpdesksettingsComponent } from './helpdesksettings/helpdesksettings.component';
import { ToastrModule } from 'ngx-toastr';
import { MyticketsComponent } from './mytickets/mytickets.component';
import { ArticleByIdComponent } from './article-by-id/article-by-id.component';
import { KeysPipe } from './pipes/keys.pipe';
import { UserprofileComponent } from './userprofile/userprofile.component';
import { NotfoundComponent } from './notfound/notfound.component';
import { EmailsettingsComponent } from './emailsettings/emailsettings.component';
import { AllnotificationsComponent } from './allnotifications/allnotifications.component';
import { QuillModule } from 'ngx-quill';
import { AutofocusDirective } from './directives/autofocus.directive';
import { TagsettingsComponent } from './tagsettings/tagsettings.component';
import { SlaPoliciesSettingsComponent } from './sla-policies-settings/sla-policies-settings.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { DynamicImgSrcPipe } from './pipes/dynamic-img-src.pipe';
import { UpdateUserProfileComponent } from './update-user-profile/update-user-profile.component';

const appRoutes: Routes = [
  	{path: '', redirectTo: 'home', pathMatch: 'full'},
    {path: 'home' ,component:HomeComponent,data: { breadcrumb: 'Home' }},
    {path: 'updateUserProfile' ,component:UpdateUserProfileComponent,data: { breadcrumb: 'updare-user-profile' }},
    {path: 'topic-form' ,component:TopicsComponent,data: { breadcrumb: 'topic-form' }},
    {path: 'mytickets' ,component:MyticketsComponent,data: { breadcrumb: 'mytickets' }},
  	{path: 'dashboard', component:DashboardComponent,data: { breadcrumb: 'dashboard' },
  	children: [
		{path: '', redirectTo: 'tickets', pathMatch: 'full'}, 
		{path: 'tickets', component:TicketsComponent,data: { breadcrumb: 'tickets' },},
		{path: 'tickets/ticketDetail/:id/:type', component: TicketDetailComponent,data: { breadcrumb: 'details' }},
		{path: 'teams', component: TeamsComponent,data: { breadcrumb: 'teams' }},
		{path: 'updateteam/:id', component: UpdateteamComponent,data: { breadcrumb: 'update-team' }},
		{path: 'settings', component: SettingsComponent,data: { breadcrumb: 'settings' }},
		{path: 'knowledge-base', component: KnowledgeBaseComponent,data: { breadcrumb: 'knowledge-base' }},
		{path: 'manageknowledgebase', component: ManageknowledgebaseComponent,data: { breadcrumb: 'knowledge-base'},},
	    {path: 'manageknowledgebase/categoryknowledgebase', component: CategoryknowledgebaseComponent,data: { breadcrumb: 'knowledge-base category' }},
		{path: 'manageknowledgebase/showsubcategories/articleknowledgebase', component: ArticleknowledgebaseComponent,data: { breadcrumb: 'article' }},
		{path: 'manageknowledgebase/showsubcategories/:id/:category_title', component: ShowsubcategoriesComponent,data: { breadcrumb: 'subcategories' }},
		{path: 'generalsettings', component: GeneralsettingsComponent,data: { breadcrumb: 'general setting' }},
		{path: 'profile', component: ProfileComponent,data: { breadcrumb: 'profile' }},
		{path: 'user', component: UserComponent,data: { breadcrumb: 'users' }},
		{path: 'userprofile/:user_id', component: UserprofileComponent,data: { breadcrumb: 'profile' }},
		{path: 'canned', component: CannedComponent,data: { breadcrumb: 'canned response' }},
		{path: 'reports', component: ReportsComponent,data: { breadcrumb: 'reports' }},
		{path: 'helpdesksettings', component: HelpdesksettingsComponent,data: { breadcrumb: 'helpdesk settings' }},
		{path: 'emailsettings', component: EmailsettingsComponent,data: { breadcrumb: 'email-setting' }},
		{path: 'allnotifications', component: AllnotificationsComponent,data: { breadcrumb: 'notifications' }},
		{path: 'tagsettings', component: TagsettingsComponent,data: { breadcrumb: 'tagsettings' }},
		{path: 'sla-policies-settings', component: SlaPoliciesSettingsComponent,data: { breadcrumb: 'email-setting' }},
		
    ]},
    {path: 'login', component:LoginComponent,data: { breadcrumb: 'dashboard' }},
    {path: 'register', component:RegisterComponent,data: { breadcrumb: 'dashboard' }},
    {path: 'forgetpassword', component:ForgetpasswordComponent,data: { breadcrumb: 'dashboard' }},
    {path: 'topics', component:TopicsComponent,data: { breadcrumb: 'topics' }},
    {path: 'topic-form/:id/:name', component:TopicFormComponent,data: { breadcrumb: 'topic-form' }},
    {path: 'article-by-id/:id/:category_title/:articles', component:ArticleByIdComponent,data: { breadcrumb: 'article-by-id' }},
    {path: 'knowledgebase/:id/:name/:parent_category/:articles', component:KnowledgeBaseComponent,data: { breadcrumb: 'knowedgebase' }},
    {path: 'viewticket/:id', component:ViewticketComponent,data: { breadcrumb: 'viewticket' }},
    {path: 'viewticket/:id/:email', component:ViewticketComponent,data: { breadcrumb: 'viewticket' }}
    //{path: '**', redirectTo: '404',pathMatch: 'full'},
   // {path:'404', component:NotfoundComponent}
  ]

export function getAuthServiceConfigs() {
  	let config = new AuthServiceConfig(
      [
        {
          id: FacebookLoginProvider.PROVIDER_ID,
        provider: new FacebookLoginProvider("325221204906702")
        },
        {
          id: GoogleLoginProvider.PROVIDER_ID,
        provider: new GoogleLoginProvider("1026380040561-mhgf3cuclsslgv7hf5a964fi21khhcu1.apps.googleusercontent.com")
        }
      ]
  );
  return config;
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    HomeComponent,
    TopicsComponent,
    TopicFormComponent,
    KnowledgeBaseComponent,
    FilterPipe,
    TruncatePipe,
    TimeDiffPipe,
    TicketsComponent,
    SettingsComponent,
    ProfileComponent,
    TeamsComponent,
    TicketDetailComponent,
    UpdateteamComponent,
    ManageknowledgebaseComponent,
    UserHeaderComponent,
    UserFooterComponent,
    UserComponent,
    CategoryknowledgebaseComponent,
    ArticleknowledgebaseComponent,
    ShowsubcategoriesComponent,
    ViewticketComponent,
    RegisterComponent,
    ForgetpasswordComponent,
    CannedComponent,
    ReportsComponent,
    GeneralsettingsComponent,
    HelpdesksettingsComponent,
    MyticketsComponent,
    ArticleByIdComponent,
    KeysPipe,
    UserprofileComponent,
    NotfoundComponent,
    EmailsettingsComponent,
    AllnotificationsComponent,
    AutofocusDirective,
    SlaPoliciesSettingsComponent,
    TagsettingsComponent,
    BreadcrumbComponent,
    DynamicImgSrcPipe,
    UpdateUserProfileComponent
  ],
 
  imports: [
  	NgSelectModule,MyDatePickerModule,Angular2FontawesomeModule,NgPipesModule ,QuillModule,//NgxEditorModule
    BrowserModule,BrowserAnimationsModule,HttpClientModule,NgxPaginationModule,NgxDatatableModule,FormsModule,SocialLoginModule,
    ToastrModule.forRoot({
	    timeOut: 3000,
	    positionClass: 'toast-top-right',
	    preventDuplicates: true,
	}),
    RouterModule.forRoot(
      appRoutes,{ useHash: true }
    )
  ],
  providers: [{
      provide: AuthServiceConfig,
      useFactory: getAuthServiceConfigs
    },{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}],
  bootstrap: [AppComponent]
})

export class AppModule { }
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);