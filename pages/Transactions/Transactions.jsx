// Global Deps
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import moment from 'moment';
// Local Deps
import cms from '../../config/messages';
import {
        defaultPaginationPage,
        defaultPaginationCount
      } from '../../config/properties';
import { fields } from '../../config/transactionsTable';
import Routes from '../../constants/Routes';
import yodleeContainers from '../../constants/enums/yodleeContainers';
// Utils
import { forwardTo } from '../../utils/navigationUtils';
import { calculateNinetyDayPastDate } from '../../utils/dateUtils';
import { populateTransactionsRoute } from '../../utils/routeUtils';
// Actions
import { getTransactionsByUser } from '../../actions/global/transactions';
// Components
import TransactionsTableComponent from '../../components/TransactionsTable/wrappers/TransactionsTableWrapper';
import LoadingHexagon from '../../components/LoadingHexagon/LoadingHexagon';
import Pagination from '../../components/Pagination/Pagination';

class Transactions extends Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    transactions: PropTypes.array.isRequired,
    totalCount: PropTypes.number.isRequired,
    isFetchingTransactions: PropTypes.bool.isRequired,
    sideNavHasRendered: PropTypes.bool.isRequired,
    location: PropTypes.shape({
      query: PropTypes.object.isRequired
    }).isRequired
  };

  static _requestTransactionsData({ location, dispatch }) {
    // Dates:
    const today = moment();
    const pastDate = calculateNinetyDayPastDate(today);
    // Pagination:
    const page = get(location, 'query.page', defaultPaginationPage);
    const count = get(location, 'query.count', defaultPaginationCount);

    dispatch(getTransactionsByUser({
      dateStart: pastDate,
      dateEnd: today,
      page,
      count,
      container: [
        yodleeContainers.bank,
        yodleeContainers.creditCard
      ]
    }));
  }

  static _configureTable(tableConfig) {
    if (isEmpty(tableConfig.transactions)) { return {}; }
    return {
      transactions: tableConfig.transactions,
      dispatch: tableConfig.dispatch,
      fields: tableConfig.fields
    };
  }

  static _configurePagination({
    totalCount,
    count,
    activePage,
    onPageChange
  }) {
    if (totalCount < 1) { return {}; }
    const numberOfItemsPerPage = count || defaultPaginationCount;
    return {
      activePage: Number(activePage),
      itemsCountPerPage: Number(numberOfItemsPerPage),
      totalItemsCount: totalCount,
      onChange: onPageChange
    };
  }

  componentDidMount() {
    const {
      dispatch,
      location,
    } = this.props;

    const { _requestTransactionsData } = Transactions;
    _requestTransactionsData({
      location,
      dispatch
    });
  }

  componentWillReceiveProps(nextProps) {
    const {
      dispatch,
      location,
    } = nextProps;

    const { _requestTransactionsData } = Transactions;
    if (location.query !== this.props.location.query) {
      _requestTransactionsData({ location, dispatch });
    }
  }

  _handlePageChange(pageNumber) {
    const { location } = this.props;
    const count = get(location, 'query.count', defaultPaginationCount);
    const url = populateTransactionsRoute({
      page: pageNumber,
      count
    });
    forwardTo(url);
  }

  render() {
    const {
      _configureTable,
      _configurePagination
    } = Transactions;
    const {
      dispatch,
      transactions,
      totalCount,
      isFetchingTransactions,
      sideNavHasRendered,
      location
    } = this.props;
    // Initialize
    const page = get(location, 'query.page', defaultPaginationPage);
    const count = get(location, 'query.count', defaultPaginationCount);
    const isLoading = !sideNavHasRendered || isFetchingTransactions;
    // Configure Pagination
    const paginationConfig = _configurePagination({
      totalCount,
      count,
      activePage: page,
      onPageChange: pageNumber => this._handlePageChange(pageNumber)
    });
    // Configure Table
    const tableConfig = _configureTable({
      dispatch,
      transactions,
      fields
    });

    return !isLoading && (
      <div className="lc-transactions-page animated fadeIn">
        <div className="lc-transactions-page__content lc-table-dimensions-parent--height">
          <div className="lc-row">
            {/* <!--HEADER--> */}
            <h1 className="lc-transactions-page__header lc-table-dimensions-parent--width">
              {cms['transactions.header']}
            </h1>
            {/* <!--TEXT--> */}
            <div className="lc-transactions-page__text">
              {cms['transactions.text']}
            </div>
            {/* <!--TRANSACTIONS TABLE--> */}
            <div className="lc-transactions-page__table">
              {isLoading ?
                <LoadingHexagon /> :
                <TransactionsTableComponent {...tableConfig} />
              }
            </div>
            {/* <!--NOTE-->} */}
            <div className="lc-transactions-page__note">
              {cms['transactions.note']}
            </div>
            {/* <!--PAGINATION--> */}
            <div className="lc-column lc-column--pagination columns medium-12">
              {totalCount > 0 && <Pagination {...paginationConfig} /> }
            </div>
            {/* <!--BUTTONS--> */}
            <div className="lc-transactions-page__buttons-container">
              <Link to={Routes.connect} >
                <button className="lc-transactions-page__button lc-transactions-page__button--left">
                  {cms['transactions.button.left']}
                </button>
              </Link>
              <Link to={Routes.incomeSummary} >
                <button className="lc-transactions-page__button lc-transactions-page__button--right">
                  {cms['transactions.button.right']}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps({ transactions, globalReducer }) {
  return {
    ...transactions,
    isLoadingAccounts: globalReducer.isLoadingAccounts
  };
}

export default connect(mapStateToProps)(Transactions);
