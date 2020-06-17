// Interfaces
import infPlayer from './interfaces/infPlayer';
import infSearch from "./interfaces/infSearch";
import infVideo from "./interfaces/infVideo";
import infMultiPlayer from "./interfaces/infMultiPlayer";

// Global
import {apiUrl, debugMode} from '../global/vars';

// Utilities
import htmlEntities from "../utilities/html-entities";
import { fetchData } from "../api/apiCall";
import { waitFor } from "../utilities/wait-for";

// Components
import setPreVideoTitle from "./components/pre-video-title";
import VideoTitle from "./components/video-title";
import InfoCard from "./components/info-card";

// Styles
import '../scss/main.scss';

export default class PlayerManager {
    private id: string = "";
    private rootEl: HTMLDivElement = null;
    private playerParams: infPlayer = null;
    private searchParams: infSearch = null;
    private videoParams: infVideo = null;
    private keywords: string = null;

    private videoTitle: HTMLParagraphElement = null;
    private infoCard: HTMLDivElement = null;

    // From outside, it's a dailymotion player
    private players: any[] = [];

    public cpeId: string[] = [];
    public cpeParams: object = {};
    public multiplayerParams: infMultiPlayer = null;

    public constructor(id: string, rootEl: HTMLDivElement, keywords?: string) {
        this.rootEl = rootEl;
        this.id = id;

        this.keywords = keywords;

        this.addEventListeners();
        this.extractAttrs();
    }

    private addEventListeners() {
        /**
         * Listen to `dm-api-ready` to run `loadDmPlayer` to construct the player
         */
        document.addEventListener('dm-api-ready', ( e: Event) => {
            //@ts-ignore
            if (e.detail === this.id) {
                this.loadDmPlayer(this.rootEl);
            }
        });

        /**
         * Listen to `player-extracted` to wait all attributes is extracted from the element
         * then prepare the search parameters
         */
        document.addEventListener('dm-player-extracted', (e: Event) => {
            //@ts-ignore
            if (e.detail === this.id) {
                this.prepareSearchParams();
            }
        });

        /**
         * Listen to `dm-search-params-ready` after parameters is ready then start search
         * related/recent video
         */
        document.addEventListener( 'dm-search-params-ready', (e: Event) => {
            //@ts-ignore
            if (e.detail === this.id) {
                if (this.playerParams.videoId === null) {
                    this.searchVideo();
                } else {
                    this.getVideoInfo(this.playerParams.videoId, true);
                }
            }
        });

        document.addEventListener('dm-video-updated', (e: Event) => {
            //@ts-ignore
            this.getVideoInfo(e.detail.videoId, false);
        });

    }

    private extractAttrs() {
        const rootEl = this.rootEl;

        /**
         * See interfaces/infPlayer.ts to know further
         */
        this.playerParams = {
            maxWordSearch: rootEl.getAttribute('maxWordSearch') ? Number(rootEl.getAttribute('maxWordSearch')) : 15,
            minWordLength: rootEl.getAttribute('minWordLength') ? Number(rootEl.getAttribute('minWordLength')) : 4,
            minWordSearch: rootEl.getAttribute('minWordSearch') ? Number(rootEl.getAttribute('minWordSearch')) : 2,
            videoId: rootEl.getAttribute('videoId') ? rootEl.getAttribute('videoId') : null,
            language: rootEl.getAttribute("language") ? rootEl.getAttribute("language") : "",
            sort:  rootEl.getAttribute("sort") ? rootEl.getAttribute("sort") : "recent",
            owners: rootEl.getAttribute("owners") ? rootEl.getAttribute("owners") : "",
            category: rootEl.getAttribute("category") ? rootEl.getAttribute("category") : "",
            excludeIds: rootEl.getAttribute("excludeIds") ? rootEl.getAttribute("excludeIds") : "",
            searchInPlaylist: rootEl.getAttribute("searchInPlaylist") ? rootEl.getAttribute("searchInPlaylist") : false,
            syndication: rootEl.getAttribute("syndication") ? rootEl.getAttribute("syndication") : "",
            controls: (rootEl.getAttribute('controls') != 'false'),
            adsParams: rootEl.getAttribute('adsParams') ? rootEl.getAttribute('adsParams') : "contextual",
            cpeId: rootEl.getAttribute('cpeId') ? rootEl.getAttribute('cpeId').split(',') : [''],
            keywordsSelector: rootEl.getAttribute('keywordsSelector') ? rootEl.getAttribute('keywordsSelector') : null,
            startDate: rootEl.getAttribute('startDate') ? rootEl.getAttribute('startDate') : null,
            getUpdatedVideo: ( rootEl.getAttribute('getUpdatedVideo') != 'false' ) ,
            preVideoTitle: rootEl.getAttribute('preVideoTitle') ? rootEl.getAttribute('preVideoTitle') : null,
            showVideoTitle: ( rootEl.getAttribute('showVideoTitle') != 'false' &&  rootEl.getAttribute('showVideoTitle') != null ),
            showInfoCard: ( rootEl.getAttribute('showInfoCard') != 'false' &&  rootEl.getAttribute('showInfoCard') != null ),
            autoPlayMute: ( rootEl.getAttribute("autoPlayMute") != 'false'),
            queueEnable: ( rootEl.getAttribute('queueEnable') != 'false'),
            queueEnableNext: ( rootEl.getAttribute('queueEnableNext') != 'false'),
            pipAtStart: ( rootEl.getAttribute('pipAtStart') != 'false' && rootEl.getAttribute('pipAtStart') != null ),
            noStp: ( rootEl.getAttribute('noStp') != 'false' && rootEl.getAttribute('noStp') != null ),
            noPip: ( rootEl.getAttribute('noPip') != 'false' && rootEl.getAttribute('noPip') != null ),
            scrollToPause: ( rootEl.getAttribute('scrollToPause') != 'false' && rootEl.getAttribute('scrollToPause') != null ),
            stpSound: ( rootEl.getAttribute('stpSound') != 'false' && rootEl.getAttribute('stpSound') != null ),
            playerStyleEnable: ( rootEl.getAttribute('playerStyleEnable') != 'false' && rootEl.getAttribute('playerStyleEnable') != null ),
            playerStyleColor: rootEl.getAttribute('playerStyleColor') ? rootEl.getAttribute('playerStyleColor') : null
        };

        this.multiplayerParams = {
            adCoverPlay: ( rootEl.getAttribute('adCoverPlay') != 'false'),
            closePip: ( rootEl.getAttribute('closePip') != 'false'),
        };

        if (debugMode === true) {
            console.log("%c DM Player Params: ", "background: #56C7FF; color: #232323", this.playerParams);
        }

        // Tell the event listener that player parameters is extracted
        const playerExtracted = new CustomEvent('dm-player-extracted', { detail: this.id});
        document.dispatchEvent(playerExtracted);
    }

    /**
     * Set search parameters
     *
     * For all search parameters, please see interfaces/infSearch.ts
     */
    private prepareSearchParams(): void {
        this.cpeId = this.playerParams.cpeId;
        const keywords = this.findKeywords(this.playerParams.keywordsSelector);
        this.searchParams = {
            fields: this.playerParams.showInfoCard ? 'id,title,description,owner.avatar_190_url' : 'id,title',
            limit: 1,
            sort: this.playerParams.sort,
        };

        if (this.playerParams.sort === "relevance") {
            this.searchParams.search= this.keywords ? this.keywords : keywords.sort((a, b) => b.length - a.length).slice(0, this.playerParams.maxWordSearch).join(' ');
        }

        if (this.playerParams.startDate !== null) {
            this.searchParams.created_after = new Date(this.playerParams.startDate).getTime() / 1000;
        }

        if (!this.playerParams.searchInPlaylist) {

            // TODO: test using private video
            this.searchParams.private = 0;
            this.searchParams.flags = "no_live,exportable" + (this.playerParams.owners.length > 0 ? "": ",verified");
            this.searchParams.longer_than = 0.35; //21sec

            if (this.playerParams.owners) this.searchParams.owners = this.playerParams.owners;

            if (this.playerParams.category) this.searchParams.channel = this.playerParams.category;

            if (this.playerParams.excludeIds) this.searchParams.exclude_ids = this.playerParams.excludeIds;
        }

        if (this.playerParams.language) this.searchParams.language = this.playerParams.language;

        // Tell the event listener that search params is ready
        const searchParamsReady = new CustomEvent('dm-search-params-ready', { detail: this.id})
        document.dispatchEvent(searchParamsReady);

    }

    private loadDmPlayer(rootEl: HTMLDivElement): void {
        const cpeEmbed = document.createElement("div");

        /**
         * Set attributes part
         */
        let queryString = "";

        if (this.playerParams.adsParams === "") {
            queryString += "ads_params=contextual";
        } else {
            queryString += "ads_params=" + htmlEntities(this.playerParams.adsParams);
        }

        if (this.playerParams.syndication !== "") queryString += "&syndication=" + this.playerParams.syndication;

        if (this.playerParams.controls !== true) queryString += "&controls=" + this.playerParams.controls;

        cpeEmbed.setAttribute("class", "dailymotion-cpe");
        cpeEmbed.setAttribute("video-id", this.videoParams.id);
        cpeEmbed.setAttribute("query-string", queryString);

        if (this.playerParams.pipAtStart === true) cpeEmbed.setAttribute("pip-at-start", "");

        if (this.playerParams.noStp === true) cpeEmbed.setAttribute("no-stp", "");

        if (this.playerParams.noPip === true) cpeEmbed.setAttribute("no-pip", "");

        if (this.playerParams.queueEnable === false) cpeEmbed.setAttribute("no-queue", "");

        if (this.playerParams.queueEnableNext === false) cpeEmbed.setAttribute("no-autonext", "");

        if (this.playerParams.searchInPlaylist !== false) cpeEmbed.setAttribute("Playlist-id", this.playerParams.searchInPlaylist as string);

        if(rootEl.getAttribute("width") !== null){
            this.playerParams.width = Number(rootEl.getAttribute("width"));
            cpeEmbed.setAttribute("width", rootEl.getAttribute("width"));
        }

        if(rootEl.getAttribute("height") !== null){
            this.playerParams.height = Number(rootEl.getAttribute("height"));
            cpeEmbed.setAttribute("height", rootEl.getAttribute("height"));
        }

        // end of set attributes
        let cpeParams = {};

        if (this.playerParams.scrollToPause === true) cpeParams['scroll_to_pause'] = true;

        if (this.playerParams.stpSound === true) cpeParams['stp_sound'] = true;

        if (this.playerParams.playerStyleEnable === true) cpeParams['player_style_enable'] = true;

        if (this.playerParams.playerStyleColor !== null) cpeParams['player_style_color'] = this.playerParams.playerStyleColor;

        this.cpeParams = cpeParams;

        // Append the element to the root player element
        rootEl.appendChild(cpeEmbed);

        /**
         * Set pre title for video
         */
        if (this.playerParams.preVideoTitle !== null) {
            const preTitle = setPreVideoTitle(this.playerParams.preVideoTitle);
            rootEl.insertAdjacentElement('afterbegin', preTitle);
        }

        // Send to DmManager that element already created
        const ElementCreated = new CustomEvent('dm-video-holder-ready');
        document.dispatchEvent(ElementCreated);
    }

    private setVideo(video: infVideo, createNew?: boolean): void {
        this.videoParams = video;

        if (createNew) {
            const apiReady = new CustomEvent("dm-api-ready", {detail: this.id})
            document.dispatchEvent(apiReady);
        }

        this.updateVideoInfo();
    }

    private updateVideoInfo() {
        /**
         * Set a video title
         */
        if ( this.playerParams.showVideoTitle === true) {
            const videoTitle = new VideoTitle();
            if (this.videoTitle !== null) {
                this.videoTitle.remove();
            }

            this.videoTitle = videoTitle.setVideoTitle(this.videoParams.title);
            this.rootEl.insertAdjacentElement('afterend', this.videoTitle);
        }

        /**
         * Set an info card
         */
        if (this.playerParams.showInfoCard === true) {
            const infoCard = new InfoCard();
            if (this.infoCard !== null) {
                this.infoCard.remove();
            }

            this.infoCard = infoCard.setInfoCard(this.videoParams);
            this.rootEl.insertAdjacentElement('afterend', this.infoCard);
        }

    }

    private async getVideoInfo(videoId: string, createNew: boolean) {
        const url = apiUrl + "/video/" + videoId + '?fields=' + this.searchParams.fields;
        const video: infVideo = await fetchData(url);

        this.setVideo(video, createNew);
    }


    private async searchVideo(): Promise<void> {

        if (debugMode === true && this.playerParams.sort === 'relevance') {
            console.log("%c DM related ", "background: #56C7FF; color: #232323", "Search: " + this.searchParams.search);
        }

        // Waiting for search params to be ready
        await waitFor( () => this.searchParams !== null, 100, 5000, "Timeout waiting for searchParams not null");

        // Serialize search params before send it
        const properties = Object.entries( this.searchParams ).map( ([ key, value] ) => {
            return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        }).join('&');

        // Prepare the url before fetch the data
        const url = apiUrl + (this.playerParams.searchInPlaylist ? "playlist/" + this.playerParams.searchInPlaylist + "/videos" : "videos") + "?" + properties;

        // Start fetch the data
        const video = await fetchData(url);

        if (video) {
            if (video.total > 0) {
                this.setVideo(video.list[0], true);
            } else {
                // Strip a string to try to get video one more time if there is no video found
                this.searchParams.search = this.searchParams.search.substring(0, this.searchParams.search.lastIndexOf(' '));

                if( this.searchParams.search.split(' ').length >= this.playerParams.minWordSearch && this.searchParams.search.length > 0 )
                    await this.searchVideo();
                else {
                    // TODO: separate log module to utilities
                    if (debugMode === true) {
                        console.log("%c DM related ", "background: #56C7FF; color: #232323", "Can not find related video. Fallback video used.");
                    }
                    this.getFallbackVideo();
                }
            }

        }

    }

    private async getFallbackVideo(): Promise<void> {

        // Define current time and 30 days
        const currentTime = Math.floor(Date.now()/1000);
        const thirtyDays = 2592000;

        // Generate url to call
        const url = apiUrl + (this.playerParams.searchInPlaylist ? "playlist/" + this.playerParams.searchInPlaylist + "/videos?" : "videos?owners=" + this.playerParams.owners)  + (this.playerParams.getUpdatedVideo ? "&created_after=" + (currentTime - thirtyDays) : "") + "&sort=random&limit=1&fields=" + this.searchParams.fields;
        const video = await fetchData(url);

        if (video) {
            if (video.list.length > 0) {
                /**
                 * Data return array, get the first array and pass it to setVideo function
                 */
                this.setVideo(video.list[0], true);
            } else {
                if (debugMode === true) {
                    console.warn("DM related Unable to find a fallback video");
                }
            }
        }

    }

    /**
     * Find keywords strings on website
     *
     * selector must be a meta tag placed in head
     */
    private findKeywords(selector?: string): string[] {
        let keywords = [''];

        if ( selector !== null ) {
            try {
                const keywordContainer = document.querySelector(selector);
                keywords = this.sanitizeKeywords(keywordContainer.textContent ? keywordContainer.textContent : keywordContainer.getAttribute("content"));
            } catch (e) {
                if (debugMode === true) {
                    console.error("Can't find selector: ", selector);
                }
            }

        } else if ( selector === null && typeof document.getElementsByTagName("h1")[0] !== "undefined") {
            keywords = this.sanitizeKeywords(document.getElementsByTagName("h1")[0].textContent);
        }

        return keywords;
    }

    /**
     * Sanitize keywords based on language
     *
     * Hangul (Korea): \u3131-\uD79D
     * Alphabet: a-zA-Z0-9
     * Latin Character: \u00C0-\u00FF
     * Devanagri (India): \u0900-\u097F
     * Urdu (Arab): \u0621-\u064A \u0660-\u0669
     */
    // TODO: improve sanitize the keywords to strip duplicate string
    protected sanitizeKeywords(keywords: string): string[] {
        return keywords.replace(/[^- \u3131-\uD79D a-zA-Z0-9 \u00C0-\u00FF \u0900-\u097F \u0621-\u064A \u0660-\u0669 \u0153]/g, ' ')
            .split(' ')
            .filter(word => word.length >= this.playerParams.minWordLength);
    }

}