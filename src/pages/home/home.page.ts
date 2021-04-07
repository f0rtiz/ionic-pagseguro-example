import { Component } from '@angular/core';
import Payment from 'src/models/Payment';
import { PagseguroService } from 'src/services/pagseguro/pagseguro.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  formPayment: Payment = new Payment()

  constructor(
    private pagseguroService: PagseguroService
  ) {}
  
  send(){
    this.pagseguroService.updateForm(this.formPayment)

  }

}
