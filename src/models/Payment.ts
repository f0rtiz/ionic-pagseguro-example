export default class Payment{
  full_name: string
  cpf: string
  codigo: string
  plano: string
  birthDate: string
  validCpf: boolean
  cardToken: string
  hash: string

  card: Card = new Card()
  address: Address = new Address()
}

export class Address{
  logradouro: string
  number: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
  cep: string
}

export class Card{
  brand: string
  number: string
  expiration: string
  cvv: string
  token: string
}