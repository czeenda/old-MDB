import {useContext, useEffect, useState, useRef} from 'react';
import {Link} from 'react-router-dom'

import {MyContext} from '../../context/MyContext'

import {useAuth} from '../../context/AuthProvider'

import {supabase} from '../../supabase/client'

import Item from './Item'

const SortableList = () => {
    
  	const {auth, user, logout} = useAuth()

	const {deck, setDeck} = useContext(MyContext)

	const { deckID, setDeckID} = useContext(MyContext)

	const { deckName, setDeckName} = useContext(MyContext)

  	const { renamed, setRenamed} = useContext(MyContext)

	const { addedCard, setAddedCard} = useContext(MyContext)

	const [ saved, setSaved] = useState(false)

	const [ newDeckName, setNewDeckName] = useState(deckName)
	const [ showButton, setShowButton] = useState(false)


	const isFirstRun = useRef(true)
	
	const isFirstRunComp = useRef(true)


  useEffect(() => {

		// Skip the first run (mount)
		if (isFirstRunComp.current) {
			isFirstRunComp.current = false;
			return;
		  }

		const loadData = async () => {
			try {
				const {data, error} = await supabase
					.from('Cards2')
					.select('*')
					.eq('deck_id', deckID)
					

					//console.log("ok")

					if (error) {
					console.log(error)
				} else {
					console.log("načteno")
					setDeck(data)
					//console.log(data)

				}
			}
			catch (error) {
				console.log(error)
			}
		}

		loadData();
		
	}, [deckID])

 /* 	useEffect(() =>{
		console.log(deck)
	},[deck]) */

	useEffect(() => {
		setNewDeckName(deckName)
	}, [deckID])


	useEffect(() => {
		// Skip the first run (mount)
		if (isFirstRun.current) {
		  isFirstRun.current = false;
		  return;
		}
	  
		const saveCards = async () => {
		  try {
			// Delete cards with the specified deck_id
			const deleteResult = await supabase
			  .from('Cards2')
			  .delete()
			  .eq('deck_id', deckID);
			
			// Check for errors in the delete operation
			if (deleteResult.error) {
			  console.log(deleteResult.error);
			  return; // Exit the function if there's an error in the delete operation
			}
			
			console.log("Deleted existing cards for deck_id:", deckID);
			
			// Insert new cards into the 'Cards' table
			const insertResult = await supabase
			  .from('Cards2')
			  .insert(deck);
			
			// Check for errors in the insert operation
			if (insertResult.error) {
			  console.log(insertResult.error);
			} else {
			  console.log("Inserted new cards for deck_id:", deckID, deckName);
			  // setDecks(insertResult.data) // Uncomment and modify as needed
			  console.log(insertResult.data);
			}
		  } catch (error) {
			console.log(error);
			setSaved(prev => !prev);
		  }
		};
	  
		saveCards();
		console.log("uloženo");
		console.log(deck);
	  
	  }, [addedCard]);
	  

  //const lands = deck.filter((element) => element.type.includes("Land"))

	const saveAndLoadData = async () => {
    try {
      // Delete cards with the specified deck_id
      const deleteResult = await supabase
        .from('Cards2')
        .delete()
        .eq('deck_id', deckID);

      // Check for errors in the delete operation
      if (deleteResult.error) {
        console.log(deleteResult.error);
        return; // Exit the function if there's an error in the delete operation
      }

      console.log("Deleted existing cards for deck_id:", deckID);

      // Insert new cards into the 'Cards' table
      const insertResult = await supabase
        .from('Cards2')
        .insert(deck);

      // Check for errors in the insert operation
      if (insertResult.error) {
        console.log(insertResult.error);
      } else {
        console.log("Inserted new cards for deck_id:", deckID, "And deck name", deckName);
        // setDecks(insertResult.data) // Uncomment and modify as needed
        console.log(insertResult.data);

        //setSaved(!saved)
      }

      // Load data after saving
      const { data, error } = await supabase
        .from('Cards2')
        .select('*')
        .eq('deck_id', deckID);

      if (error) {
        console.log(error);
      } else {
        console.log("Data loaded successfully");
        setDeck(data);
        //alert("Data loaded successfully");
      }
    } catch (error) {
      console.log(error);
    }
  };
  
    const moveItem = (dragIndex, hoverIndex) => {
      const draggedItem = deck[dragIndex];
      setDeck(prevItems => {
        const newItems = [...prevItems];
        newItems.splice(dragIndex, 1);
        newItems.splice(hoverIndex, 0, draggedItem);
        return newItems;
      });
	  //console.log(deck)
    };

    const handleRemoveClick = (id) => {
      const updatedDeck = deck.filter((_, index) => index !== id);
      setDeck(updatedDeck);
	  setAddedCard(prev => !prev)
      console.log(id)
    };

	
	const handleRename = async () => {
		const { data, error } = await supabase
		.from('Decks')
		.update({ name: newDeckName})
		.eq('id', deckID)
		.select()

		setRenamed(data)

		
		if (error) {
			console.error(error);
		} else {
			console.log(data);
			setShowButton(prev => !prev)
		}

	};

    
  
    if(auth){
    return (
        <div id="workon">
        
          {deckName && 
          
          <div className='w-100 d-flex flex-rows'>

            {/* <h4 className='d-inline-block my-auto'>{newDeckName}</h4> */}
            <div className="input-group">
  				    <input type="text" className="form-control border" placeholder="Name of new deck" aria-label="Recipient's username" aria-describedby="button-addon2"
				      value={newDeckName} onChange={(e) => setNewDeckName(e.target.value)} onClick={() => setShowButton(prev => !prev)}/>
  				    {showButton && <button className="btn btn-outline-secondary" type="button" /* id="button-addon2" */ onClick={handleRename}>Přejmenovat</button>}
			    </div>

            <button onClick={saveAndLoadData} className={`d-inline-block mb-0 btn ${deck ? "btn-primary" : "btn-danger"} ms-1`}>Uložit karty</button>
            
            
	        </div>}

          {deck === false ? <Link to="/">Vyberte váš balíček</Link> : 
          <div>
            <div className='cards mt-1'>

			
            {deck.map((item, index) => (
              <Item key={index} id={index} name={item.name} url={item.image_url} index={index} type={item} moveItem={moveItem} handleRemoveClick={handleRemoveClick}/>
            ))}
			

			

            
            </div>

            {/* <div className='cards creatures'>

            {deck.map((item, index) => (
              <Item key={index} id={index} name={item.name} url={item.image_url} index={index} type={item} moveItem={moveItem} handleRemoveClick={handleRemoveClick}/>
            ))}
            
            </div> */}
            
            </div>}

        

        </div>
        
    )}
  };

  export default SortableList