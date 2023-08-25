import React, { useState } from 'react';
import useSWR from 'swr';
import styles from '../pages/styles/page.module.css'
import Image from 'next/image';
import '@fortawesome/fontawesome-free/css/all.min.css';

const fetcher = async (url: any) => {
  const response = await fetch(url);
  return response.json();
};

const removeCurrencyFormatting = (currencyString: string) : number => {
  return parseInt(currencyString.replace(/[^0-9.-]+/g, ""));
};

const SheetRenderer = (families: any) => {

  const familyData = families.wrapper

  const [collapsedRows, setCollapsedRows] = useState<Array<boolean>>(
    new Array(familyData.length).fill(true)
  );
  const [searchKeyword, setSearchKeyword] = useState('');
  const [rotation, setRotation] = useState(0);
  const [cardRotations, setCardRotations] = useState<Array<number>>(
    new Array(familyData.length).fill(0)
  );

  const handleImageClick = (index: number) => {
    setCardRotations((prevCardRotations) => {
      const newCardRotations = [...prevCardRotations];
      newCardRotations[index] = (newCardRotations[index] + 180) % 360;
      return newCardRotations;
    });
  };
  const imageStyles = `${styles['toggle-btn']} ${
    rotation === 180 ? styles['rotate-180'] : ''
  }`;

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(event.target.value);
  };
  const filteredRows = familyData.filter((family: any) =>
    family.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    family.description.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const toggleCollapse = (index: number) => {
    setCollapsedRows((prevCollapsedRows) => {
      const newCollapsedRows = [...prevCollapsedRows];
      newCollapsedRows[index] = !newCollapsedRows[index];
      return newCollapsedRows;
    });
  };

  return (
    <div>
      {/*<div className="nav">
        {sheetNames.map((sheet: string, index: number) => (
          <div
            className={`title ${index === activeTab ? 'active' : ''}`}
            key={index}
            onClick={() => handleTabClick(index)}
          >{sheet}</div>
        ))}
      </div>*/}
      <div className={styles.main}>

        <Image className={styles.banner} src="https://swgu-library.onrender.com/images/ICONS/banner-tree.png" alt="" height={100} width={500} />
        <h2 className={styles['main-title']}>Help Maui Rise! </h2>
        <div id={styles['search-bar-wrapper']}>
          <div className={styles['search-bar']} id={styles['search-bar']}>
            <input
              id={styles['search-input']}
              className={styles['search-input']}
              type="text"
              placeholder="Search keywords"
              value={searchKeyword}
              onChange={handleSearchChange}
            />
            <i id={styles['search-icon']} className={`fa fa-search ${styles['search-icon']}`} aria-hidden="true"></i>
          </div>
        </div>
  
        <ul className={styles['sheet-rows']}>
          <p className={styles['sheet-rows-heading']}>
            Each family listed below has been verified and has been directly affected by the devastating August 2023 Maui fires. Click on the &lsquo;GoFundMe&rsquo; Link or Other next to a family&rsquo;s name to be redirected to their official link to donate. <br /><br /> 
            The data on this site is powered by a <a className={styles.a} target="_blank" href="https://docs.google.com/spreadsheets/d/1lExatubPl6zvsDcy4qUd3Sv1PvvKrzMhUyOzaKuId0o/edit?pli=1#gid=194434303">Google Doc</a> made by the community. GoFundMe info is updated every hour. <br /><br />
            Mahalo Nui Loa for willing to help these families! &#128591;</p>
          {filteredRows.map((row: any, rowIndex: any) => (
            <li className={styles.card} key={rowIndex} onClick={() => toggleCollapse(rowIndex)}>
              <h3>
                {row.name} - {' '}
                {row.donationLink ? (
                  <a className={styles.donate} href={row.donationLink} target="_blank" rel="noopener noreferrer">
                    {row.donationLabel || 'DONATE NOW'}
                  </a>
                ) : (
                  <a target="_blank" className={styles.donate} >
                    {row.donationLabel || ''}
                  </a>
                )}
                {row.goFundMeRaisedAmount && (
                  <div className={styles.progressBarContainer}>
                    <p className={styles.raised}>
                      Raised <b>{row.goFundMeRaisedAmount}</b> out of {row.goFundMeGoal}
                    </p>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressBarFill}
                        style={{
                          width: `${
                            ((removeCurrencyFormatting(row.goFundMeRaisedAmount) /
                              removeCurrencyFormatting(row.goFundMeGoal)) *
                            100).toString()}%`
                        }}
                      ></div>
                    </div>
                  </div>
                )}
                <Image 
                  width={30} height={30} 
                  src="https://swgu-library.onrender.com/images/ICONS/down-green.png" alt=""         
                  onClick={() => handleImageClick(rowIndex)}
                  className={`${imageStyles} ${styles['rotate-icon']}`}  
                  style={{
                    transform: `translate(-50%, 40%) rotate(${cardRotations[rowIndex]}deg)`
                  }}
                  />
              </h3>
              {collapsedRows[rowIndex] ? null : (
                <>
                  <p style={{ textIndent: '2em' }}>{row.description}</p>
                </>
              )}
            </li>
          ))}
        </ul>

        <div className={styles['right-container']}>
          <p id={styles['main-p']} className={styles['main-p']}><a target="_blank" href="https://bit.ly/helpmauirise-submitohana">https://bit.ly/helpmauirise-submitohana</a> <br />Please use this form to submit your family`s information to get them added to this list. Information will be verified.</p>
          <p className={styles['main-p']}>You can help <i>directly</i> aid `Ohana displaced by the fires</p>
          <p className={styles['main-p']}>For developers, visit the <a target="_blank" href="https://github.com/razznblue/Maui-Fires-Relief">github page</a> if you would like to contribute to this website.</p>
        </div>

      </div>
    </div>
  );
};

const handleLoading = () => {
  return <div className={styles.main}><div className={styles.loading}>Loading Latest Info...</div></div>
}

const handleLoadError = (error: any) => {
  console.log('Error loading data: ', error);
  return <div>Error loading data: <span>{error}</span></div>;
}

const Home = () => {
  const { data, error } = useSWR('/api/family', fetcher);

  if (error) return handleLoadError(error)
  if (!data) return handleLoading()

  return (
    <div className={styles['home-container']}>
      <SheetRenderer wrapper={data} />
    </div>
  );
};

export default Home
