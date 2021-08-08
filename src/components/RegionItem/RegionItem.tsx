import React, {FC, useState, useEffect} from 'react'
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { useActions } from '../../hooks/useActions';
import {IRegionItem} from '../../types/types'
import L from 'leaflet'

import './regionItemStyle.css'

//----------------------------------------------------

const RegionItem: FC<IRegionItem> = ({layer, info , region_id , signaler}) => {
    const { removeRegionItemAction,
            updateRegionItemInfoAction } = useActions()

    const { mapPointer: map,
            currentRegionId } = useTypedSelector(state => state.app)

    const [isOpend, setIsOpend] = useState(false)
    const [regionItemName, setRegionItemName] = useState('Новый елемент')
    const [isEditable, setIsEditable] = useState(false)


    //----------------------------------------------

    useEffect(()=>{
        if(info){
            setRegionItemName(info[1])
        }
    }, [])

    //----------------------------------------------

    useEffect(()=>{
        if(region_id === currentRegionId){
            setIsEditable(state => true)
        } 
        else {
            setIsEditable(state => false)
            setIsOpend(state => false)
        }
    }, [currentRegionId])

    //----------------------------------------------

    const removeRegionItemHandler = (layer:any)=>{ 
        let answer:boolean = window.confirm("Вы действительно хотите удалить этот елемент? ");
        if(!answer) return 

        removeRegionItemAction(layer._leaflet_id)
    }

    const findRegionItemHandler = (layer: any)=>{
        let itemType =  layer instanceof L.Rectangle ? 'Rectangle': 
                        layer instanceof L.Polygon ? 'Polygon': 
                        layer instanceof L.Polyline ? 'Polyline':
                        layer instanceof L.Circle ? 'Circle': '';  

        if(itemType === "Polygon" || itemType === "Rectangle") map!.setView(layer._latlngs[0][0], map!.getZoom())        

        if(itemType === "Polyline") map!.setView(layer._latlngs[0], map!.getZoom())

        if(itemType === "Circle") map!.setView(layer._latlng, map!.getZoom()) 
    }

    const setNewStyleRegionItemHandler = (layer: any) => {
        layer.setStyle({
            color: 'red'
        });
    }

    const setPrevStyleRegionItemHandler = (layer: any) => {
        layer.setStyle({
            color: "#3388ff"
        });        
    }

    //------------------------------------------------

     let itemType = layer instanceof L.Rectangle ? 'Rectangle': 
                   layer instanceof L.Polygon ? 'Polygon': 
                   layer instanceof L.Polyline ? 'Polyline':
                   layer instanceof L.Circle ? 'Circle': ''; 

    //------------------------------------------------    

    const setRegionItemNameHandler = (event: React.ChangeEvent<HTMLTextAreaElement>)=> {
        signaler()
        updateRegionItemInfoAction([layer._leaflet_id, event.target.value])
        setRegionItemName(state => event.target.value)
    } 

    //------------------------------------------------

    return (
        <div className="a__region-item"
             onMouseOver={()=>setNewStyleRegionItemHandler(layer)}
             onMouseOut={()=>setPrevStyleRegionItemHandler(layer)}             
             >
            <div className="a__region-item-header">
                {/* layer._leaflet_id */}{regionItemName}              
            </div>

            <div className="a__tool-panel">
                <div className="a__btn a__remove-btn" 
                     title="Удалить елемент"
                     onClick={isEditable ? ()=>removeRegionItemHandler(layer) : ()=>alert('Начните редактирование этого региона')}
                >
                   <i className="fas fa-trash-alt"></i>
                </div>

                <div className="a__btn a__find-element-btn" 
                     title="Найти элемент на карте"
                     onClick={isEditable ? ()=>findRegionItemHandler(layer) : ()=>alert('Начните редактирование этого региона')}
                >
                   <i className="fas fa-search-location"></i>
                </div>

                <div className="a__btn a__pencil-btn" 
                     title="Добавить информацию об елементе"
                     onClick={isEditable ? ()=>setIsOpend(state => !state) : ()=>alert('Начните редактирование этого региона')}
                >
                   <i className="fas fa-pencil-alt"></i>
                </div>

            </div>

            <div className={isOpend ? "a__comments a__opened" : "a__comments"}>
                <span>Information:</span>  
                <textarea value={regionItemName} 
                            onChange={setRegionItemNameHandler} 
                            rows={3}                              
                />                                     
            </div>

                                
            
        </div>
    )
}

export default RegionItem
