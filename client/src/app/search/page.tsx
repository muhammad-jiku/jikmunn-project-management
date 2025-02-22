import SearchComp from '@/_components/search/SearchComp';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search - Project Management Dashboard',
  description: 'Generated by create next app',
};

const Search = () => {
  return <SearchComp />;
};

export default Search;
