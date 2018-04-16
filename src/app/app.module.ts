import { BrowserModule } from '@angular/platform-browser';
import { NgModule} from '@angular/core';
import { MatButtonModule, MatCardModule, MatToolbarModule, MatInputModule, MatListModule } from '@angular/material';
import { MatSelectModule } from '@angular/material/select'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { FormsModule } from '@angular/forms'
import { AppComponent } from './app.component';
import {UtilModule} from './util/util.module';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    UtilModule, BrowserModule, MatButtonModule, MatCardModule, MatToolbarModule, MatInputModule, MatListModule, MatSelectModule, BrowserAnimationsModule, FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
