import React, {FC, useEffect, useState} from 'react'
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { useActions } from '../../hooks/useActions';
import { useHttp } from '../../hooks/useHttp'
import { useHistory } from "react-router-dom";
//import { v4 as uuid } from 'uuid'
//import shortid from 'shortid';
import uniqueId from 'lodash/uniqueId';


import L from 'leaflet';

import '@geoman-io/leaflet-geoman-free';  
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'; 

import Region from '../Region/Region'
import RegionFromDb from '../RegionFromDb/RegionFromDb'
import { IRegionFromDb } from '../../types/types'

import './viewPanelStyle.css'


//-------------------------------------------------------

const ViewPanel: FC = () => {
    const { 
            viewPanelIsOpened, 
            unsavedLayersIsOpened,
            savedLayersIsOpened,
            mapLayers,
            mapPointer: map,
            currentRegionId,
            onMapRegions
          } = useTypedSelector(state => state.app)

    const { setUnsavedLayersIsOpenedAction,
            setSavedLayersIsOpenedAction,
            setCurrentRegionIdAction,
            addNewRegionAction,
            setUserIsAuthorizedAction        
        } = useActions()
        
    //---------------------------------------------------------

    const {request} = useHttp()
    let history = useHistory();
    const [isLoading, setLoading] = useState(false)
    const [regionsInfo, setRegionsInfo] = useState([])
    const [reloadingRegionsFromDb, setReloadingRegionsFromDb] = useState(false)

    //---------------------------------------------------------
    
    /**
     * it is needed to reload regions from database
     * and it is executed  when 'reloadingRegionsFromDb' variable has value as true 
     */
    useEffect(()=>{        
        if(reloadingRegionsFromDb) { 
            setRegionsInfo(state => [])           
            downloadRegionsHandler()
            setReloadingRegionsFromDb(state => false)
        }
    }, [reloadingRegionsFromDb])

    //---------------------------------------------------------
    
    const unsavedLayersOnClickHandler = ()=>{
        if(unsavedLayersIsOpened) return

        setUnsavedLayersIsOpenedAction(!unsavedLayersIsOpened)
        setSavedLayersIsOpenedAction(!savedLayersIsOpened)
    }

    const savedLayersOnClickHandler = ()=>{
        if(savedLayersIsOpened) return

        setUnsavedLayersIsOpenedAction(!unsavedLayersIsOpened)
        setSavedLayersIsOpenedAction(!savedLayersIsOpened)
    }

    const createNewRegionHandler = () => {
        let layerGroup: any = L.layerGroup([])
        layerGroup.addTo(map!)        

        //console.log('layerGroup=', layerGroup)
        //console.log('layerGroup._leaflet_id=', layerGroup._leaflet_id)

        addNewRegionAction([
                             {
                                 leaflet_id: layerGroup._leaflet_id,
                                 regionLayer: layerGroup,                                 
                                 regionItemInfo: []
                             },
                             layerGroup._leaflet_id
                           ])
    }

    const logOutHandler = async () => {
        console.log('log out')

        let answer:boolean = window.confirm("Вы действительно хотите выйти?");
        if(!answer) return 

        let userData: string | null = localStorage.getItem('userData')
        let token: string;

        if(userData) token = JSON.parse(userData).token
        else {
            alert('Токен доступа отсутствует. Пройдите авторизацию')
            return
        }           

        try {
            const data = await request('http://127.0.0.1:8000/api/logout', 
                                      'post',
                                       {}, 
                                       {'Authorization': `Bearer ${token}`}) 

            /* const data = await request('http://45.84.226.158:5050/api/logout', 
                                       'post',
                                        {}, 
                                        {'Authorization': `Bearer ${token}`}) */         
            console.log('data= ', data)

            if(data.isError) {
                alert('Error: ' + data.message)
            } else if(data.message === 'token_deleted') {
                localStorage.removeItem('userData');
                setUserIsAuthorizedAction(false)
                //history.push("/auth");
            } 

         } catch(e) {
             alert('Error: ' + e.message)
             throw e 
         } 
    }

    //---------------------------------------------------------

    const downloadRegionsHandler = async () => {
        setLoading(state => true)

        let userData: string | null = localStorage.getItem('userData')
        let token: string;

        if(userData) token = JSON.parse(userData).token
        else {
            alert('Токен доступа отсутствует. Пройдите авторизацию')
            return
        }           

        try {
            const data = await request('http://127.0.0.1:8000/api/get_regions_info', 
                                      'post',
                                       {}, 
                                       {'Authorization': `Bearer ${token}`}) 

            /* const data = await request('http://45.84.226.158:5050/api/logout', 
                                       'post',
                                        {}, 
                                        {'Authorization': `Bearer ${token}`}) */         
            console.log('data= ', data)
            
            if(data.isError) {
               alert('Error: ' + data.message)
            } else if(data.message === 'done') {                
               setRegionsInfo(state => data.payload)             
            } 
         } catch(e) {
             alert('Error: ' + e.message)
             throw e 
         } 
        
         setLoading(state => false)   
    }

    //.........................................................
    
    return (
        <div className={viewPanelIsOpened ? "a__view-panel a__is-opened": "a__view-panel"} >                    
           
           <div className="a__top-box">
               <div className={unsavedLayersIsOpened ? "a__unsaved-layers-btn a__active" : "a__unsaved-layers-btn"} 
                    title="Панель редактирования"
                    onClick={unsavedLayersOnClickHandler}
               >
                  <i className="fas fa-map-marked-alt"></i>
               </div>

               <div className={savedLayersIsOpened ? "a__saved-layers-btn a__active" : "a__saved-layers-btn"} 
                    title="Регионы из базы данных "
                    onClick={savedLayersOnClickHandler}
               >
                  <i className="fas fa-database"></i>
               </div>

               {currentRegionId > 0 ? 
                  <div className={unsavedLayersIsOpened ? "a__create-region-btn" : "a__create-region-btn a__disabled"} 
                       title="Создать новый регион"
                       onClick={()=>{alert('Завершите редактирование региона')}}
                  >
                      <i className="fas fa-plus"></i>
                  </div>
                  :
                  <div className={unsavedLayersIsOpened ? "a__create-region-btn" : "a__create-region-btn a__disabled"} 
                       title="Создать новый регион"
                       onClick={createNewRegionHandler}
                  >
                     <i className="fas fa-plus"></i>
                  </div>   
               }

                <div className={unsavedLayersIsOpened ? "a__download-btn a__disabled" : "a__download-btn"}  
                    title="Загрузить регионы"
                    onClick={downloadRegionsHandler}
                >
                  <i className="fas fa-download"></i>
               </div>  

               <div className={"a__log-out-btn"} 
                    title="Выйти"
                    onClick={logOutHandler}
               >
                  <i className="fas fa-sign-out-alt"></i>
               </div>  


           </div> 

           {/* ======================================================= */}

           <div className={unsavedLayersIsOpened ? "a__unsaved-layers-container a__active" : "a__unsaved-layers-container" }>
               {              
                 onMapRegions.map((o, i)=>{ 
                   //console.log('unique key=', uniqueId())                                      
                   return <Region  obj={o} key={o.leaflet_id}/>                    
                 })
               }
           </div>

           <div className={savedLayersIsOpened ? "a__saved-layers-container a__active" : "a__saved-layers-container" }>
               
               <div className={isLoading ? "a__spinner": "a__spinner a__disabled"}>
                  <div>Загрузка ...</div>
                  <div className="lds-dual-ring"></div> 
               </div>
               
               {regionsInfo.map((obj:IRegionFromDb, i)=>{
                  return <RegionFromDb 
                            info={obj.info} 
                            uuid={obj.uuid} 
                            key={obj.uuid}
                            reloader={()=>setReloadingRegionsFromDb(state=> true)}
                         />
               })}

               

               
               
           </div>


        </div>
    )
}

export default ViewPanel




