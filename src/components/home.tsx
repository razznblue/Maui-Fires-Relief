import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import styles from '../pages/styles/page.module.css'
import Image from 'next/image';
import '@fortawesome/fontawesome-free/css/all.min.css';

const fetcher = async (url: any) => {
  const response = await fetch(url);
  return response.json();
};

const SheetRenderer = (wrapper: any) => {
  const {sheets} = wrapper;
  const parsedSheets = JSON.parse(sheets);

  const [collapsedRows, setCollapsedRows] = useState<Array<boolean>>(
    new Array(parsedSheets[0].rows.length).fill(true)
  );
  const [searchKeyword, setSearchKeyword] = useState('');
  const [rotation, setRotation] = useState(0);
  const [cardRotations, setCardRotations] = useState<Array<number>>(
    new Array(parsedSheets[0].rows.length).fill(0)
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
  const filteredRows = parsedSheets[0].rows.filter((row: any) =>
    row.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    row.description.toLowerCase().includes(searchKeyword.toLowerCase())
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
          {filteredRows.map((row: any, rowIndex: any) => (
            <li className={styles.card} key={rowIndex} onClick={() => toggleCollapse(rowIndex)}>
              <h3>
                {row.name} - {' '}
                {row.donationLink ? (
                  <a className={styles.donate} href={row.donationLink} target="_blank" rel="noopener noreferrer">
                    {row.donationLabel || 'DONATE NOW'}
                  </a>
                ) : (
                  <a className={styles.donate} >
                    {row.donationLabel || ''}
                  </a>
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
                <p style={{ textIndent: '2em' }}>{row.description}</p>
              )}
            </li>
          ))}
        </ul>

        <div className={styles['right-container']}>
          <p className={styles['main-p']}>You can help <i>directly</i> aid `Ohana displaced by the fires</p>
          <p id={styles['main-p']} className={styles['main-p']}>Please start a group DM on Instagram to <a href="https://www.instagram.com/kennareed/">@kennareed</a>, <a href="https://www.instagram.com/ssamakaio/">@ssamakaio</a>, <a href="https://www.instagram.com/@gwubby/">@gwubby</a> if you know of any more `ohana to add to this list!</p>
          <p className={styles['main-p']}>For developers, visit the <a href="https://github.com/razznblue/Maui-Fires-Relief">github page</a> if you would like to contribute to this website.</p>
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

const MyPage = () => {
  // Fetch Latest Data
  useEffect(() => {
    fetch('/api/scrape2');
  }, [])

  const { data, error } = useSWR('/api/retrieve', fetcher)
  if (error) return handleLoadError(error)
  if (!data) return handleLoading()

  return (
    <div className={styles['home-container']}>
      <SheetRenderer sheets={data} />
    </div>
  );
};

export default MyPage
