import React, { Component } from 'react'
import { Header, Divider, Form, Button, Segment } from 'semantic-ui-react'
import TruffleContract from 'truffle-contract'
import ReactTable from 'react-table'


import getWeb3 from './utils/getWeb3'
import KeyStoreContract from './contracts/KeyStore.json'

import './App.css'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-table/react-table.css'

const columns =  [{
   Header: 'First Name',
   accessor: 'first_name',
 }, {
   Header: 'Last Name',
   accessor: 'last_name',
 }, {
   Header: 'Type',
   accessor: 'type',
 }, {
   Header: 'Key',
   accessor: 'key',
 }, {
   Header: 'Verified',
   accessor: 'verified',
}, {
  Header: 'Compromised',
  accessor: 'compromised',
}]


class App extends Component {

  state = {
    loaded: false,
    triedInit: false,
    email: '',
    firstName: '',
    lastName: '',
    key: '',
    searchEmail: '',
    rows: [],
    type: '',
  }

  componentDidMount() {
    this.initWeb3()
    setTimeout(() => {
      this.setState({
        triedInit: true,
      })
    }, 1000)
  }

  initWeb3() {
    getWeb3.then(({ web3 }) => {
      console.log('web3: ', web3)
      this.setState({
        web3: web3,
      })
      this.initContract(web3)
    }).catch(err => {
      console.error("error finding web3: ", err)
    })
  }

  initContract(web3) {
    web3.eth.getAccounts((err, accounts) => {
      if (err) {
        console.error("error finding accounts: ", err)
        return
      }

      const token = TruffleContract(KeyStoreContract)
      token.setProvider(this.state.web3.currentProvider)
      token.defaults({from: accounts[0]})

      token.at('0x574145d19c3e33518dE2c95A947182901E2Ad021').then(contract => {
        this.setState({
          contract: contract,
          account: accounts[0],
        })

        this.initData()
      }).catch(err => {
        console.error("error finding contracts: ", err)
      })
    })
  }

  async initData() {
    this.setState({
      loaded: true,
    })
  }

  handleChange = (ev) => {
    let elements = {}
    elements[ev.target.dataset['propName']] = ev.target.value
    this.setState(elements)
  }

  handleSubmit = (ev) => {
    ev.preventDefault()
    this.state.contract.addKey(this.state.email, this.state.firstName, this.state.lastName, this.state.key, this.state.type).then(() => {
      this.setState({keyResults: 'Key added succefully!'})
    }).catch(err => {
      console.error(err)
      this.setState({keyResults: 'Key failed to be added!'})
    })
  }

  handleSearchSubmit = (ev) => {
    ev.preventDefault()
    let promises = [];
    let i = 0;
    for (i = 0; i < 10; ++i) {
      let key_promise =  this.state.contract.getKey(this.state.searchEmail, i).then((e) => {
        return JSON.parse(e)
      })
      promises.push(key_promise)
    }

    Promise.all(promises)
         .then((results) => {
           results = results.filter(function (el) {
            return Object.keys(el).length != 0;
          });
          this.setState({
              rows: results
          })
           console.log("All done", results)
         })
         .catch((e) => {
             // Handle errors here
    });
  }

  render() {
    if (!this.state.loaded) {
      if (!this.state.triedInit) {
        return <p>Loading...</p>
      } else {
        return (
          <Segment>
            <h2>No connection to Thunder</h2>
            <p>Please make sure you are using a DApp browser such as MetaMask or Mist.</p>
            <p> This contract is deployed to the Thundercore Test Net</p>
            <p> Thundercore Wallet Instructions: <a href='https://www.thundercore.com/wallet-instructions'>https://www.thundercore.com/wallet-instructions</a> </p>
            <p> Add custom RPC on MetaMask withthe following values:


          </p>
          <table>
            <tr>
              <td>Network Name </td>
              <td> Thundercore Test Net </td>
            </tr>
            <tr>
              <td>New RPC URL</td>
              <td> https://testnet-rpc.thundercore.com </td>
            </tr>
            <tr>
              <td>ChainID </td>
              <td> 18 </td>
            </tr>
            <tr>
              <td>Symbol </td>
              <td> TT </td>
            </tr>
          </table>

          <p> Once connected Go to <a href='https://faucet-testnet.thundercore.com'>https://faucet-testnet.thundercore.com</a> to get free testnet tokens.</p>
          <p>Authenticate with Google or Github. </p>
          <p>Enter Wallet address to receive tokens at (this can be found at the top of MetaMask, click Account 1 and it'll copy the address) </p>

          </Segment>
        )
      }
    }

    return (

      <div id="main" className="">
        <Header as='h1' className="name">Decentralized Key Store</Header>
        <Header as='h3'>
          <a href="https://github.com/rarshonsky/key_store_dapp"><svg width="22" height="22" class="octicon octicon-mark-github" viewBox="0 0 16 16" version="1.1" aria-hidden="true"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path></svg></a>
        </Header>
        <Divider />
        <div>
          <Segment>
            <Form onSubmit={this.handleSearchSubmit.bind(this)}>
              <Form.Field>
                <label>Email:</label>
                <input value={this.state.search_email} onChange={this.handleChange.bind(this)} data-prop-name= 'searchEmail'/>
              </Form.Field>
              <Button type="submit" className="btn btn-info btn-lg" data-toggle="modal" data-target="#searchResults">Search</Button>
            </Form>
          </Segment>
        </div>
        <Divider />
        <div>
          <Segment>
            <Form onSubmit={this.handleSubmit.bind(this)}>
              <Form.Field>
                <label>Email:</label>
                <input value={this.state.email} onChange={this.handleChange.bind(this)} data-prop-name= 'email'/>
              </Form.Field>
              <Form.Field>
                <label>First Name:</label>
                <input value={this.state.firstName} onChange={this.handleChange.bind(this)} data-prop-name = 'firstName'/>
              </Form.Field>
              <Form.Field>
                <label>Last Name</label>
                <input value={this.state.lastName} onChange={this.handleChange.bind(this)} data-prop-name = 'lastName'/>
              </Form.Field>
              <Form.Field>
                <label>Key:</label>
                <input value={this.state.key} onChange={this.handleChange.bind(this)} data-prop-name= 'key' />
              </Form.Field>
              <Form.Field>
                <label>Type:</label>
                <input value={this.state.type} onChange={this.handleChange.bind(this)} data-prop-name = 'type'/>
              </Form.Field>
              <Button type='submit' data-toggle="modal" data-target="#keyResults">Add Key</Button>
            </Form>
          </Segment>
        </div>
        <Divider />



        <div id="searchResults" className="fade modal" role="dialog">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Search Results</h4>
                <Button type="button" className="close" data-dismiss="modal">&times;</Button>
              </div>
              <div className="modal-body">
                <ReactTable
                  data={this.state.rows}
                  columns={columns}
                  className="-striped -highlight"
                  showPagination={false}
                />
              </div>
            </div>

          </div>
        </div>

        <div id="keyResults" className="fade modal" role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Key Add Results</h4>
                <Button type="button" className="close" data-dismiss="modal">&times;</Button>
              </div>
              <div className="modal-body">
                <h1> {this.state.keyResults} </h1>
              </div>
            </div>

          </div>
        </div>


      </div>
    )
  }
}

export default App
