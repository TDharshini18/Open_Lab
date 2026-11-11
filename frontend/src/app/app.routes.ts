import { Routes } from '@angular/router';
import { areaGuard, homeGuard } from './core/guards';
import { LoginComponent } from './pages/login.component';
import { RegisterComponent } from './pages/register.component';
import { BrowseComponent } from './pages/browse.component';
import { MyRequestsComponent } from './pages/my-requests.component';
import { CollegeComponent } from './pages/college.component';
import { AdminComponent } from './pages/admin.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', canActivate: [homeGuard], children: [] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'browse', component: BrowseComponent, canActivate: [areaGuard('COMPANY')] },
  { path: 'my-requests', component: MyRequestsComponent, canActivate: [areaGuard('COMPANY')] },
  { path: 'college', component: CollegeComponent, canActivate: [areaGuard('COLLEGE')] },
  { path: 'admin', component: AdminComponent, canActivate: [areaGuard('ADMIN')] },
  { path: '**', redirectTo: '' },
];
