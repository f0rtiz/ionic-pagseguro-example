import { Injectable } from '@angular/core';
import { LoadingController, NavController } from '@ionic/angular';

declare let PagSeguroDirectPayment;

@Injectable({
  providedIn: 'root'
})
export class PagseguroService {
  
  loader: HTMLIonLoadingElement
  imgBrand: string = ""
  processing: boolean = false
  session: any
  
  public formPayment = {
    nome: '',
    cpf: '',
    codigo: '',
    tipo: 'semestral',
    plano: '',
    birthDate: '',
    brand: '',
    number: '',
    expiration: '',
    cvv: '',
    validCpf: false,
    cardToken: '',
    hash: '',
    address:{
      logradouro: '',
      number: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
    }
  }

  constructor(
    // private pagamentoDAO: PagamentoDAO,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController
  ) {

  }

  getSession(){
    // this.pagamentoDAO.getPaymentSession().subscribe((retorno) => {
    //   PagSeguroDirectPayment.setSessionId(retorno.data.session);
    // })
  }

  addressValido(){

    let valido = true
    
    if(this.formPayment.address.cep.length != 9){
      this.presentAlert('Atenção', 'Por favor preencha com o CEP.')
      valido = false
    } else if(this.formPayment.address.logradouro == ''){
      this.presentAlert('Atenção', 'Por favor preencha com o logradouro.')
      valido = false
    } else if(this.formPayment.address.number == ''){
      this.presentAlert('Atenção', 'Por favor preencha com o number.')
      valido = false
    } else if(this.formPayment.address.bairro == ''){
      this.presentAlert('Atenção', 'Por favor preencha com o bairro.')
      valido = false
    } else if(this.formPayment.address.estado == ''){
      this.presentAlert('Atenção', 'Por favor preencha com o estado.')
      valido = false
    } else if(this.formPayment.address.cidade == ''){
      this.presentAlert('Atenção', 'Por favor preencha com o cidade.')
      valido = false
    }

    return valido
  }

  cpfValido() {
    let strCPF = this.formPayment.cpf
    this.formPayment.validCpf = true

    let i
    var Soma
    var Resto
    let valido = true
    Soma = 0;
    strCPF = ""+strCPF.replace(/[^0-9]/g,'')
    if (strCPF == "00000000000" || strCPF == "11111111111" || strCPF == "22222222222" || strCPF == "33333333333" || strCPF == "44444444444" || strCPF == "55555555555" || strCPF == "66666666666" || strCPF == "77777777777" || strCPF == "88888888888" || strCPF == "99999999999") {
      this.formPayment.validCpf = false
    }

    for (i=1; i<=9; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (11 - i)
    Resto = (Soma * 10) % 11
    
    if ((Resto == 10) || (Resto == 11))  Resto = 0;
    if (Resto != parseInt(strCPF.substring(9, 10)) ) {
      this.formPayment.validCpf = false
    }
    
    Soma = 0;
    for (i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (12 - i)
    Resto = (Soma * 10) % 11
    
    if ((Resto == 10) || (Resto == 11))  Resto = 0;
    if (Resto != parseInt(strCPF.substring(10, 11) ) ) 
      this.formPayment.validCpf = false
    
    return this.formPayment.validCpf
    
  }

  cartaoValido(){

    if(this.formPayment.nome==''){
      this.processing = false
      this.presentAlert('Atenção', 'Por favor preencha com o nome completo do titular do cartão.')
      
      return false
    }else{
      if(this.formPayment.nome.indexOf(" ")==-1 || this.formPayment.nome.split(" ")[1] == ''){
        
        // this.loader.dismiss()
        this.processing = false
        this.presentAlert('Atenção', 'Por favor preencha com o nome completo do titular do cartão.')
        
        return false
      }
    }
    
    if(this.formPayment.number.length != 19){
      
      this.presentAlert('Cartão incompleto', 'Por favor preencha com todos os números do cartão de crédito.')
      // this.loader.dismiss()
      this.processing = false
      return false
    }else if(this.formPayment.expiration.length != 7){
      this.presentAlert('Vencimento', 'Por favor preencha o expiration do cartão de crédito.')
      // this.loader.dismiss()
      this.processing = false
      return false
    }else if(this.formPayment.cvv.length < 3){
      this.presentAlert('Código de segurança', 'Por favor preencha com o código de segurança do cartão de crédito.')
      // this.loader.dismiss()
      this.processing = false
      return false
    }else{
      let cartao: String = this.formPayment.number
      return cartao
    }
  }
  
  getBandeira() {

    this.presentLoading("Validando Cartão...")
    
    if(this.formPayment.number){

      let splitCartao = this.formPayment.number.split(' ');
      // Pegar a brand do cartão
      PagSeguroDirectPayment.getBrand({
        cardBin: splitCartao[0]+splitCartao[1],
        success: response => {

          this.formPayment.brand = response.brand.name
          
          this.loader.dismiss()
          this.generateToken();
          
          // this.imgBrand = "https://stc.pagseguro.uol.com.br/public/img/payment-methods-flags/42x20/"+response.brand.name+".png";
          
        },
        error: (response) => {

          this.processing = false
          this.loader.dismiss()
          this.presentAlert('Atenção', 'Cartão Inválido. Response: '+JSON.stringify(response))
          
        },
        complete: function(response){
          console.log('complete', response)
        }
      });
    }
  }

  generateToken(){
    console.log(this.processing)
    console.log('do generateToken()')
    if(!this.processing){

      this.presentLoading("Realizando pagamento...")
      
      this.processing = true
    }
    // Hash do cliente
    var hash = PagSeguroDirectPayment.getSenderHash();
    this.formPayment.hash = hash;

    // Pegar token cartão de crédito
    let numberCartao = this.formPayment.number.replace(/\s/g, '')
    let vencimentoSplit = this.formPayment.expiration.split('/')

    var param = {
      cardNumber: numberCartao,
      cvv: this.formPayment.cvv,
      expirationMonth: vencimentoSplit[0],
      expirationYear: vencimentoSplit[1],
      brand: this.formPayment.brand,
      success: (response) => {
        this.loader.dismiss()

        //token gerado, esse deve ser usado na chamada da API do Checkout Transparente
        this.formPayment.cardToken = response.card.token ;

        if(response.card.token != ''){
          this.sendToken();
        }

      },
      error: (response) => {
        this.processing = false
        console.log(response)
        this.presentAlert('','Informe um cartão válido');
        this.dismissLoading()
      },
      complete: (response) => {
        
        console.log('complete', response)
      },
    }

    PagSeguroDirectPayment.createCardToken(param);
  }

  sendToken(){
    this.presentLoading("Realizando pagamento...")
    console.log(this.formPayment)


    // this.pagamentoDAO.doAccession(this.formPayment).subscribe(retorno =>{
    //   let mensagem = ''

    //   this.loader.dismiss()
      
    //   if(retorno.error != null){
    //     mensagem += retorno.error.code+' - '+retorno.error.message+"\n"
        
    //     this.presentAlert('Pagamento não efetuado', mensagem)
    //   } else if(retorno.data.vinculo.code != ''){
    //     this.presentAlert('Pagamento em análise', 'Dentro de instantes estaremos liberando o seu pagamento.')
    //     this.navCtrl.navigateRoot('/home')
    //   }else{
    //     this.presentAlert('Pagamento não efetuado', 'Houve algum problema na compra do plano. Verifique seu cartão de crédito ou tente novamente mais tarde.')
    //   }

      
    // })
  }
  
  async presentLoading(message) {

    this.loader = await this.loadingCtrl.create({
      message: message,
      duration: 15000,
    });
    await this.loader.present();

  }

  dismissLoading(){
    this.loader.dismiss()
  }

  
  async presentAlert(title, message) {

    this.loader = await this.loadingCtrl.create({
      message: message,
      duration: 15000,
    });
    await this.loader.present();

  }

  
}
