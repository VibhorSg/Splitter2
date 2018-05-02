import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router'
import { MatButtonModule, MatCardModule, MatToolbarModule, MatInputModule, MatListModule, MatDialogModule, MatPaginatorModule } from '@angular/material';
import { MatSelectModule } from '@angular/material/select'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { FormsModule } from '@angular/forms'
import { AppComponent } from './app.component';
import { UtilModule } from './util/util.module';
import { SenderComponent } from './sender.component'
import { RecipientComponent } from './recipient.component'
import { ContractService } from './contract.service'
import { MatTableModule } from '@angular/material/table'

const routes = [
  { path: '', component: SenderComponent },
  { path: 'recipient', component: RecipientComponent }
]

@NgModule({
  declarations: [
    AppComponent, SenderComponent, RecipientComponent
  ],
  imports: [
    UtilModule, BrowserModule, MatButtonModule, MatCardModule,
    MatToolbarModule, MatInputModule, MatListModule, MatSelectModule,
    BrowserAnimationsModule, FormsModule, RouterModule.forRoot(routes),
    MatDialogModule, MatTableModule, MatPaginatorModule
  ],
  providers: [ContractService],
  bootstrap: [AppComponent]
})
export class AppModule { }
