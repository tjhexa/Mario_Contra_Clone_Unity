////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// 	DialogScreen.js
//
//	Sets up this individual Dialog Screen.
//
//	© 2012-2013 Melli Georgiou
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

#pragma strict

import System.Reflection;

// EDITOR VALUES
@HideInInspector
var tab : int = 0;
@HideInInspector
var selLanguage : int = 0;						// NOTE: Languages aren't synced with the editor yet.
@HideInInspector
var actionTab : int = 0;
@HideInInspector
var thirdPartyActionTab : int = 0;
@HideInInspector
var audioTab : int = 0;
@System.NonSerialized
var created : boolean = false;					// We use this with the editor so we can fix a weird glitch!

// Setup
private var dc : DialogController;
var isActive : boolean = false;
var dialogID : int = 1;

// Dialog Styles
enum DIALOGSTYLE{ 			
					NextButton, 
					YesOrNo, 
					OneButton, 
					TwoButtons,
					MultipleButtons,
					DataEntry,
					Password,
					Logic 
				};

// Screen
var screen : DS_Screen = new DS_Screen();
	class DS_Screen {
		var dialogStyle : DIALOGSTYLE = DIALOGSTYLE.NextButton;
		var actorName : String = "";												// Doubles up as the title
		var dialogText : String = "";												// The actual dialog / conversation text
		var portrait : Texture2D;													// Portrait Icon
		var soundToLoad : String = "";												// Soundfilepath
		var soundPitch : float = 1.0;												// Soundpitch
		var soundFlag : boolean = false;											// ?
		var portraitFlag : boolean = false;											// ?
		var customButton1 : String = "OK";											// Custom Button 1 Label
		var customButton2 : String = "Cancel";										// Custom Button 2 Label
		var multipleButtons : String[] = ["Option 1","Option 2", "Option 3"];		// Multiple Button Label Array
		var dataEntryToken : int = 0;												// Which token should we use for Data Entry
		var dataEntryFormat : DS_DATA_FORMAT = DS_DATA_FORMAT.Text;					// The format of the data (number or text)
		var dataEntryCharacterLimit : int = 25;										// The character limit of the text
		var dataEntryDefaultValue : String = "";									// The default value for the edit field
		var dataEntryAnchor : DS_DATA_ANCHOR = DS_DATA_ANCHOR.Bottom;				// How the Data Entry screen is displayed
		var passwordMatchToToken : boolean = false;									// Password must match dataEntryToken.
		var passwordAnswer : String = "";											// The correct password for this screen.
		var passwordCaseSensitive : boolean = false;								// Should we enforce caps when comparing the password?
		var passwordMask : boolean = false;											// Should we use a password Mask? ( chars display: **** )
		
		var logicStatements : LogicStatements[];
		
	}
	
	// Logic Class
	class LogicStatements{
		var token : int = 0;
		var operator : DS_LOGIC_OPERATOR = DS_LOGIC_OPERATOR.Equals;
		var compare : String = "";
		var goToScreen : int = 1;
		var endDialogAfterThis : boolean = false;
		var destroyAtEnd : boolean = false;
	}
		
		// Logic Operators
		enum DS_LOGIC_OPERATOR{Equals,IsNot,GreaterThan,LessThan}
	
		// Screen Anchor
		enum DS_DATA_ANCHOR{Top,Middle,Bottom}
		
		// Data Entry Formats
		enum DS_DATA_FORMAT{Text,Number};

// Localizations
var localization : DS_Localizations = new DS_Localizations();
	class DS_Localizations{
		var chinese : DS_Language = new DS_Language();
		var korean : DS_Language = new DS_Language();
		var japanese : DS_Language = new DS_Language();
		var spanish : DS_Language = new DS_Language();
		var italian : DS_Language = new DS_Language();
		var german : DS_Language = new DS_Language();
		var french : DS_Language = new DS_Language();
		var portuguese : DS_Language = new DS_Language();
		var russian : DS_Language = new DS_Language();		
	}

	class DS_Language {
		
		var actorName : String = "";
		var dialogText : String = "";
		var changeAudio : boolean = false;
		var soundToLoad : String = "";
		var soundPitch : float = 1.0;
		var customButton1 : String = "";
		var customButton2 : String = "";
		var multipleButtons : String[] = ["","", ""];
		var dataEntryDefaultValue : String = "";
		var passwordAnswer : String = "";
		var logicStatementCompare : String[];		// Add this later!
	}

// Navigation Class
var navigation : DS_Navigation = new DS_Navigation();
class DS_Navigation {

	var endFlag : boolean = false;
	var secondsToDisplay : float = 3.0;
	var hideNextButton : boolean = false;				// new in v1.1
	var screenToLoadOnNext : int = 0;
	var screenToLoadOnYes : int = 0;
	var screenToLoadOnNo : int = 0;
	var multipleButtons : int[] = [0,0,0];				// new in v1.5
	var logicDefaultNavigation : int = 1;				// new in v2.5
	var noPortraitFadeIn : boolean = false;				// new in v1.1 	
	var noPortraitFadeOut : boolean = false;			// new in v1.1 	
	var endDialogAfterThis : boolean = false;
	var destroyAtEnd : boolean = false;
	
}	

// Actions Class
var actions : DS_Actions = new DS_Actions();
	class DS_Actions{
		
		// Object Creation
		var createObjectsAtStart : DSObjectCreation[] = new DSObjectCreation[0];		// Creates Objects when the screen has started
		var createObjectsAtEnd : DSObjectCreation[] = new DSObjectCreation[0];			// Creates Objects when the screen has ended
		
		// Object Activation
		var activateTheseObjectsAtStart : String[] = new String[0];				// Find And Activate these Objects when the screen has started
		var activateTheseObjectsAtEnd : GameObject[] = new GameObject[0];		// Activate these Objects when the screen has ended
		var findAndDestroyTheseObjectsAtEnd : String[] = new String[0];			// Find And destroy these game objects when the screen has ended
		
		// VISUAL NOVEL STYLE OPTIONS ( New in v2.0 )
		
		// Scene	
		var fadeAllSceneLayers : boolean = false;										// A Flag to tell the Dialog UI to fadeOut the scene completely.
		var sceneLayers : DialogUIBackgroundLayers[] = new DialogUIBackgroundLayers[10];// mimics the DialogUI setup
		
		// Actors	
		var fadeAllActorLayers : boolean = false;										// A Flag to tell the Dialog UI to fadeOut all actors completely.
		var actorLayers : DialogUIActorLayers[] = new DialogUIActorLayers[10];			// mimics the DialogUI setup
		
		// Music and Audio SFX
		var music : DSAudioSetup = new DSAudioSetup();
		var sfx1 : DSAudioSetup = new DSAudioSetup();
		var sfx2 : DSAudioSetup = new DSAudioSetup();
		var sfx3 : DSAudioSetup = new DSAudioSetup();
		
		// TOKENS
		var tokens : DSTokenActions[] = new DSTokenActions[0];
		
		// ===================
		// THIRD PARTY TOOLS
		// ===================
		
		//var camMotion : DSActionsFor_camMotion = new DSActionsFor_camMotion();
		var uSequencer : DSActionsFor_uSequencer = new DSActionsFor_uSequencer();
	}
	
		// camMotion aka (FMV)
		class DSActionsFor_camMotion{
				
		}
	
		// uSequencer Action Class
		enum DSuSequencerActionType{None,Play,Pause,Stop,Skip}
		class DSActionsFor_uSequencer{
			var go : GameObject = null;													// The actual gameObject of the uSequencer component 
			var findGo : String = "";													// The name of the uSequencer GameObject
			var setup : boolean = false;												// Setup playback Time / Rate.
			var setPlaybackTime : float = 0.0;											// SetPlayback Time
			var setPlaybackRate : float = 1.0;											// SetPlayback Rate
			var startAction : DSuSequencerActionType = DSuSequencerActionType.None;		// What action should we use
			var endAction : DSuSequencerActionType = DSuSequencerActionType.None;		// What action should we use
		}
		
		// Token Action Class
		enum DSTokenActionType{Set,Add,Subtract}
		class DSTokenActions{ 
			var index : int = 0;														// Token To Modify
			var action : DSTokenActionType = DSTokenActionType.Set;						// action to apply
			var argument : String = "";													// The argument to use (could be either a string or a number)
			var localize : boolean = false;												// Should we localize this argument?
			var localizedArgument : DS_LocalizedTokenArgument;							// Argument localizations
		}
			// Localized Arguments
			class DS_LocalizedTokenArgument{
				var chinese : String = "";
				var korean : String = "";
				var japanese : String = "";
				var spanish : String = "";
				var italian : String = "";
				var german : String = "";
				var french : String = "";
				var portuguese : String = "";
				var russian : String = "";		
			}
		
		// Audio Setup
		enum DSAudioAction{None,Play,FadeInAndPlay,FadeOut,Stop}
		public class DSAudioSetup{
			
			var source : AudioSource;													// These are automatically cached at start (copies from the DialogUI)!
			
			var action : DSAudioAction = DSAudioAction.None;
			var useAudioPath : boolean = false;
			var playFromPath : String = "";
			var clip : AudioClip;
			
			var volume : float = 1;
			var currentVolume : float = 1;												// This is a volume used for fading in (not visible in the editor)
			var pitch : float = 1;
			var loop : boolean = false;
			
			var fadeDuration : float = 2;
		}



// Object Creation Class
public class DSObjectCreation {

	var createObject : GameObject;
	var createLocation : Transform;
	var findGameObjectLocation : String;
	
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	START
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Start () {
	
	// Cache Dialog Controller
	dc = GetComponent(DialogController);
	
	// Cache the AudioSetups to have the same AudioSource as the DialogUI
	if( DialogUI != null && DialogUI.dui != null ){
		actions.music.source = DialogUI.dui.musicSource;
		actions.sfx1.source = DialogUI.dui.sfx1Source;
		actions.sfx2.source = DialogUI.dui.sfx2Source;
		actions.sfx3.source = DialogUI.dui.sfx3Source;
	}
	
	// Localize The Strings at start
	Localize();
	
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	STRING ARRAY IS EMPTY
//	(Helps Localization) Checks to see if any string in a String[] are not blank. Returns true if this array is empty.
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function StringArrayIsEmpty( arr : String[] ){
	
	var isEmpty : boolean = true;
	for( var theString : String in arr){
		if(theString!=""){
			isEmpty = false;
		}
	}
	
	// Return the result
	return isEmpty;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	LOCALIZE TOKENS
//	Localizes Token tabs
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function LocalizeTokens(){

	// Loop through all the tokens and localize them at start
	for( var token : DSTokenActions in actions.tokens ){

		// If this token has the localize flag set, let's do it!
		if(token.localize){
			
			// CHINESE
			if (	DialogLocalization.language == "Chinese" &&
					token.localizedArgument.chinese != "" ){
				token.argument = token.localizedArgument.chinese;
			}
			
			// KOREAN
			else if (	DialogLocalization.language == "Korean" &&
						token.localizedArgument.korean != "" ){
				token.argument = token.localizedArgument.korean;
			}
			
			// JAPANESE
			else if (	DialogLocalization.language == "Japanese" &&
						token.localizedArgument.japanese != "" ){
				token.argument = token.localizedArgument.japanese;
			}
			
			// GERMAN
			else if (	DialogLocalization.language == "German" &&
						token.localizedArgument.german != "" ){
				token.argument = token.localizedArgument.german;
			}
			
			// FRENCH
			else if (	DialogLocalization.language == "French" &&
						token.localizedArgument.french != "" ){
				token.argument = token.localizedArgument.french;
			}
			
			// SPANISH
			else if (	DialogLocalization.language == "Spanish" &&
						token.localizedArgument.spanish != "" ){
				token.argument = token.localizedArgument.spanish;
			}
			
			// ITALIAN
			else if (	DialogLocalization.language == "Italian" &&
						token.localizedArgument.italian != "" ){
				token.argument = token.localizedArgument.italian;
			}
			
			// PORTUGUESE
			else if (	DialogLocalization.language == "Portuguese" &&
						token.localizedArgument.portuguese != "" ){
				token.argument = token.localizedArgument.portuguese;
			}
			
			// RUSSIAN
			else if (	DialogLocalization.language == "Russian" &&
						token.localizedArgument.russian != "" ){
				token.argument = token.localizedArgument.russian;
			}
		
		}
	}	
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	LOCALIZE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Localize() {
	
	// Localize All Tokens
	LocalizeTokens();
	
	// Helper variable for localizing logic statements
	var loopCounter : int = 0;
		
	// CHINESE
	if ( DialogLocalization.language == "Chinese" ) {	
		if( localization.chinese.actorName != "" ){ screen.actorName = localization.chinese.actorName; }
		if( localization.chinese.dialogText != "" ){ screen.dialogText = localization.chinese.dialogText; }
		if ( localization.chinese.changeAudio ){ screen.soundToLoad = localization.chinese.soundToLoad; screen.soundPitch = localization.chinese.soundPitch; }
		if( localization.chinese.customButton1 != "" ){ screen.customButton1 = localization.chinese.customButton1; }
		if( localization.chinese.customButton2 != "" ){ screen.customButton2 = localization.chinese.customButton2; }
		if( localization.chinese.dataEntryDefaultValue != "" ){ screen.dataEntryDefaultValue = localization.chinese.dataEntryDefaultValue; }
		if( localization.chinese.passwordAnswer != "" ){ screen.passwordAnswer = localization.chinese.passwordAnswer; }
		if( !StringArrayIsEmpty(localization.chinese.multipleButtons) ){ screen.multipleButtons = localization.chinese.multipleButtons; }
		
		// Localize the comparison strings in each logic statement
		if( screen.logicStatements != null && screen.logicStatements.length > 0 && 
			localization.chinese.logicStatementCompare != null && 
			localization.chinese.logicStatementCompare.length == screen.logicStatements.length){ 
			loopCounter = 0;	// Reset counter
			for( var logic1 : LogicStatements in screen.logicStatements ){ 							// Loop through the logic events
				if(logic1!=null && localization.chinese.logicStatementCompare[loopCounter]!=""){		// Make sure the statement is valid and not blank, otherwise default language is used
					logic1.compare = localization.chinese.logicStatementCompare[loopCounter];			// Copy over the localized version
				}
				loopCounter++;
			}
		}
	}
	
	// KOREAN
	else if ( DialogLocalization.language == "Korean" ) {	
		if( localization.korean.actorName != "" ){ screen.actorName = localization.korean.actorName; }
		if( localization.korean.dialogText != "" ){ screen.dialogText = localization.korean.dialogText; }
		if ( localization.korean.changeAudio ){ screen.soundToLoad = localization.korean.soundToLoad; screen.soundPitch = localization.korean.soundPitch; }
		if( localization.korean.customButton1 != "" ){ screen.customButton1 = localization.korean.customButton1; }
		if( localization.korean.customButton2 != "" ){ screen.customButton2 = localization.korean.customButton2; }
		if( localization.korean.passwordAnswer != "" ){ screen.passwordAnswer = localization.korean.passwordAnswer; }
		if( !StringArrayIsEmpty(localization.korean.multipleButtons) ){ screen.multipleButtons = localization.korean.multipleButtons; }
		
		// Localize the comparison strings in each logic statement
		if( screen.logicStatements != null && screen.logicStatements.length > 0 && 
			localization.korean.logicStatementCompare != null && 
			localization.korean.logicStatementCompare.length == screen.logicStatements.length){ 
			loopCounter = 0;	// Reset counter
			for( var logic2 : LogicStatements in screen.logicStatements ){ 							// Loop through the logic events
				if(logic2!=null && localization.korean.logicStatementCompare[loopCounter]!=""){		// Make sure the statement is valid and not blank, otherwise default language is used
					logic2.compare = localization.korean.logicStatementCompare[loopCounter];			// Copy over the localized version
				}
				loopCounter++;
			}
		}
	}
	
	// JAPANESE
	else if ( DialogLocalization.language == "Japanese" ) {	
		if( localization.japanese.actorName != "" ){ screen.actorName = localization.japanese.actorName; }
		if( localization.japanese.dialogText != "" ){ screen.dialogText = localization.japanese.dialogText; }
		if ( localization.japanese.changeAudio ){ screen.soundToLoad = localization.japanese.soundToLoad; screen.soundPitch = localization.japanese.soundPitch; }
		if( localization.japanese.customButton1 != "" ){ screen.customButton1 = localization.japanese.customButton1; }
		if( localization.japanese.customButton2 != "" ){ screen.customButton2 = localization.japanese.customButton2; }
		if( localization.japanese.passwordAnswer != "" ){ screen.passwordAnswer = localization.japanese.passwordAnswer; }
		if( !StringArrayIsEmpty(localization.japanese.multipleButtons) ){ screen.multipleButtons = localization.japanese.multipleButtons; }
		
		// Localize the comparison strings in each logic statement
		if( screen.logicStatements != null && screen.logicStatements.length > 0 && 
			localization.japanese.logicStatementCompare != null && 
			localization.japanese.logicStatementCompare.length == screen.logicStatements.length){ 
			loopCounter = 0;	// Reset counter
			for( var logic3 : LogicStatements in screen.logicStatements ){ 								// Loop through the logic events
				if(logic3!=null && localization.japanese.logicStatementCompare[loopCounter]!=""){		// Make sure the statement is valid and not blank, otherwise default language is used
					logic3.compare = localization.japanese.logicStatementCompare[loopCounter];			// Copy over the localized version
				}
				loopCounter++;
			}
		}
	}
	
	// SPANISH
	else if ( DialogLocalization.language == "Spanish" ) {	
		if( localization.spanish.actorName != "" ){ screen.actorName = localization.spanish.actorName; }
		if( localization.spanish.dialogText != "" ){ screen.dialogText = localization.spanish.dialogText; }
		if ( localization.spanish.changeAudio ){ screen.soundToLoad = localization.spanish.soundToLoad; screen.soundPitch = localization.spanish.soundPitch; }
		if( localization.spanish.customButton1 != "" ){ screen.customButton1 = localization.spanish.customButton1; }
		if( localization.spanish.customButton2 != "" ){ screen.customButton2 = localization.spanish.customButton2; }
		if( localization.spanish.passwordAnswer != "" ){ screen.passwordAnswer = localization.spanish.passwordAnswer; }
		if( !StringArrayIsEmpty(localization.spanish.multipleButtons) ){ screen.multipleButtons = localization.spanish.multipleButtons; }
		
		// Localize the comparison strings in each logic statement
		if( screen.logicStatements != null && screen.logicStatements.length > 0 && 
			localization.spanish.logicStatementCompare != null && 
			localization.spanish.logicStatementCompare.length == screen.logicStatements.length){ 
			loopCounter = 0;	// Reset counter
			for( var logic4 : LogicStatements in screen.logicStatements ){ 							// Loop through the logic events
				if(logic4!=null && localization.spanish.logicStatementCompare[loopCounter]!=""){		// Make sure the statement is valid and not blank, otherwise default language is used
					logic4.compare = localization.spanish.logicStatementCompare[loopCounter];			// Copy over the localized version
				}
				loopCounter++;
			}
		}
	}
	
	// SPANISH
	else if ( DialogLocalization.language == "Italian" ) {	
		if( localization.italian.actorName != "" ){ screen.actorName = localization.italian.actorName; }
		if( localization.italian.dialogText != "" ){ screen.dialogText = localization.italian.dialogText; }
		if ( localization.italian.changeAudio ){ screen.soundToLoad = localization.italian.soundToLoad; screen.soundPitch = localization.italian.soundPitch; }
		if( localization.italian.customButton1 != "" ){ screen.customButton1 = localization.italian.customButton1; }
		if( localization.italian.customButton2 != "" ){ screen.customButton2 = localization.italian.customButton2; }
		if( localization.italian.passwordAnswer != "" ){ screen.passwordAnswer = localization.italian.passwordAnswer; }
		if( !StringArrayIsEmpty(localization.italian.multipleButtons) ){ screen.multipleButtons = localization.italian.multipleButtons; }
		
		// Localize the comparison strings in each logic statement
		if( screen.logicStatements != null && screen.logicStatements.length > 0 && 
			localization.italian.logicStatementCompare != null && 
			localization.italian.logicStatementCompare.length == screen.logicStatements.length){ 
			loopCounter = 0;	// Reset counter
			for( var logic5 : LogicStatements in screen.logicStatements ){ 							// Loop through the logic events
				if(logic5!=null && localization.italian.logicStatementCompare[loopCounter]!=""){		// Make sure the statement is valid and not blank, otherwise default language is used
					logic5.compare = localization.italian.logicStatementCompare[loopCounter];			// Copy over the localized version
				}
				loopCounter++;
			}
		}
	}
	
	// GERMAN
	else if ( DialogLocalization.language == "German" ) {	
		if( localization.german.actorName != "" ){ screen.actorName = localization.german.actorName; }
		if( localization.german.dialogText != "" ){ screen.dialogText = localization.german.dialogText; }
		if ( localization.german.changeAudio ){ screen.soundToLoad = localization.german.soundToLoad; screen.soundPitch = localization.german.soundPitch; }
		if( localization.german.customButton1 != "" ){ screen.customButton1 = localization.german.customButton1; }
		if( localization.german.customButton2 != "" ){ screen.customButton2 = localization.german.customButton2; }
		if( localization.german.passwordAnswer != "" ){ screen.passwordAnswer = localization.german.passwordAnswer; }
		if( !StringArrayIsEmpty(localization.german.multipleButtons) ){ screen.multipleButtons = localization.german.multipleButtons; }
		
		// Localize the comparison strings in each logic statement
		if( screen.logicStatements != null && screen.logicStatements.length > 0 && 
			localization.german.logicStatementCompare != null && 
			localization.german.logicStatementCompare.length == screen.logicStatements.length){ 
			loopCounter = 0;	// Reset counter
			for( var logic6 : LogicStatements in screen.logicStatements ){ 							// Loop through the logic events
				if(logic6!=null && localization.german.logicStatementCompare[loopCounter]!=""){		// Make sure the statement is valid and not blank, otherwise default language is used
					logic6.compare = localization.german.logicStatementCompare[loopCounter];			// Copy over the localized version
				}
				loopCounter++;
			}
		}
	}
	
	// FRENCH
	else if ( DialogLocalization.language == "French" ) {	
		if( localization.french.actorName != "" ){ screen.actorName = localization.french.actorName; }
		if( localization.french.dialogText != "" ){ screen.dialogText = localization.french.dialogText; }
		if ( localization.french.changeAudio ){ screen.soundToLoad = localization.french.soundToLoad; screen.soundPitch = localization.french.soundPitch; }
		if( localization.french.customButton1 != "" ){ screen.customButton1 = localization.french.customButton1; }
		if( localization.french.customButton2 != "" ){ screen.customButton2 = localization.french.customButton2; }
		if( localization.french.passwordAnswer != "" ){ screen.passwordAnswer = localization.french.passwordAnswer; }
		if( !StringArrayIsEmpty(localization.french.multipleButtons) ){ screen.multipleButtons = localization.french.multipleButtons; }
		
		// Localize the comparison strings in each logic statement
		if( screen.logicStatements != null && screen.logicStatements.length > 0 && 
			localization.french.logicStatementCompare != null && 
			localization.french.logicStatementCompare.length == screen.logicStatements.length){ 
			loopCounter = 0;	// Reset counter
			for( var logic7 : LogicStatements in screen.logicStatements ){ 							// Loop through the logic events
				if(logic7!=null && localization.french.logicStatementCompare[loopCounter]!=""){		// Make sure the statement is valid and not blank, otherwise default language is used
					logic7.compare = localization.french.logicStatementCompare[loopCounter];			// Copy over the localized version
				}
				loopCounter++;
			}
		}
	}
	
	// PORTUGUESE
	else if ( DialogLocalization.language == "Portuguese" ) {	
		if( localization.portuguese.actorName != "" ){ screen.actorName = localization.portuguese.actorName; }
		if( localization.portuguese.dialogText != "" ){ screen.dialogText = localization.portuguese.dialogText; }
		if ( localization.portuguese.changeAudio ){ screen.soundToLoad = localization.portuguese.soundToLoad; screen.soundPitch = localization.portuguese.soundPitch; }
		if( localization.portuguese.customButton1 != "" ){ screen.customButton1 = localization.portuguese.customButton1; }
		if( localization.portuguese.customButton2 != "" ){ screen.customButton2 = localization.portuguese.customButton2; }
		if( localization.portuguese.passwordAnswer != "" ){ screen.passwordAnswer = localization.portuguese.passwordAnswer; }
		if( !StringArrayIsEmpty(localization.portuguese.multipleButtons) ){ screen.multipleButtons = localization.portuguese.multipleButtons; }
		
		// Localize the comparison strings in each logic statement
		if( screen.logicStatements != null && screen.logicStatements.length > 0 && 
			localization.portuguese.logicStatementCompare != null && 
			localization.portuguese.logicStatementCompare.length == screen.logicStatements.length){ 
			loopCounter = 0;	// Reset counter
			for( var logic8 : LogicStatements in screen.logicStatements ){ 								// Loop through the logic events
				if(logic8!=null && localization.portuguese.logicStatementCompare[loopCounter]!=""){		// Make sure the statement is valid and not blank, otherwise default language is used
					logic8.compare = localization.portuguese.logicStatementCompare[loopCounter];			// Copy over the localized version
				}
				loopCounter++;
			}
		}
	}
	
	// RUSSIAN
	else if ( DialogLocalization.language == "Russian" ) {	
		if( localization.russian.actorName != "" ){ screen.actorName = localization.russian.actorName; }
		if( localization.russian.dialogText != "" ){ screen.dialogText = localization.russian.dialogText; }
		if ( localization.russian.changeAudio ){ screen.soundToLoad = localization.russian.soundToLoad; screen.soundPitch = localization.russian.soundPitch; }
		if( localization.russian.customButton1 != "" ){ screen.customButton1 = localization.russian.customButton1; }
		if( localization.russian.customButton2 != "" ){ screen.customButton2 = localization.russian.customButton2; }
		if( localization.russian.passwordAnswer != "" ){ screen.passwordAnswer = localization.russian.passwordAnswer; }
		if( !StringArrayIsEmpty(localization.russian.multipleButtons) ){ screen.multipleButtons = localization.russian.multipleButtons; }
		
		// Localize the comparison strings in each logic statement
		if( screen.logicStatements != null && screen.logicStatements.length > 0 && 
			localization.russian.logicStatementCompare != null && 
			localization.russian.logicStatementCompare.length == screen.logicStatements.length){ 
			loopCounter = 0;	// Reset counter
			for( var logic9 : LogicStatements in screen.logicStatements ){ 							// Loop through the logic events
				if(logic9!=null && localization.russian.logicStatementCompare[loopCounter]!=""){		// Make sure the statement is valid and not blank, otherwise default language is used
					logic9.compare = localization.russian.logicStatementCompare[loopCounter];			// Copy over the localized version
				}
				loopCounter++;
			}
		}
	}
	
	// SKIP IF UNKNOWN LANGUAGE
	else {
		
		// debug message to let us know that the language is not supported and we are rolling back to english!
		if( DialogLocalization.language != "English" ){
			Debug.Log(gameObject.name+" (DialogScreen ID: "+dialogID+") - Localization defaulting to English.");
		}
	}
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	SETUP
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Setup() {

	yield;	// 1 frame delay!

	// If this is the current screen and we can see the DialogUI
	if ( isActive && DialogUI != null && !DialogUI.dui.forceClose ){
	
		// Set up the screen and tell the ui to Fade in
		if ( DialogUI.status == DUISTATUS.ENDED || DialogUI.status == DUISTATUS.WAITFORSCREEN ) { 
			
			// If we are using Dialog Logic, then use the LogicSetup() function instead.
			if( screen.dialogStyle == DIALOGSTYLE.Logic ){
			
				LogicSetup();
			
			// Otherwise, setup the dialog normally ..	
			} else {
			
				// Setup Tokens
				DialogUI.dui.TokenActions(actions.tokens);
				
				// Use Player's real name in dialogs
				DialogUI.actorName = screen.actorName;
				
				// Dialog Text
				DialogUI.dialogText = screen.dialogText;
		
				// Update portrait
				DialogUI.portrait = screen.portrait;
				
				// Set Duration
				DialogUI.screenDuration = navigation.secondsToDisplay;
			
				// Tell the DialogUI to activate and set up the fade in
				DialogUI.isActive = true;
				DialogUI.screen = this;
	
				DialogUI.dialogStyle = screen.dialogStyle;
				DialogUI.customButton1 = screen.customButton1;
				DialogUI.customButton2 = screen.customButton2;
				DialogUI.multipleButtons = screen.multipleButtons;
				
				DialogUI.dataEntryToken = screen.dataEntryToken;
				DialogUI.dataEntryFormat = screen.dataEntryFormat;
				DialogUI.dataEntryCharacterLimit = screen.dataEntryCharacterLimit;
				DialogUI.dataEntryDefaultValue = screen.dataEntryDefaultValue;
				DialogUI.dataEntryString = screen.dataEntryDefaultValue;	// Set value to default!
				DialogUI.dataEntryAnchor = screen.dataEntryAnchor;
				
				DialogUI.passwordMatchToToken = screen.passwordMatchToToken;
				DialogUI.passwordAnswer = screen.passwordAnswer;
				DialogUI.passwordCaseSensitive = screen.passwordCaseSensitive;
				DialogUI.passwordMask = screen.passwordMask;
				
				DialogUI.hideNextButton = navigation.hideNextButton;
				DialogUI.noPortraitFadeIn = navigation.noPortraitFadeIn;
				DialogUI.noPortraitFadeOut = navigation.noPortraitFadeOut;
				DialogUI.status = DUISTATUS.SHOW;
				
				// Setup Background and Actor Layers
				SetupBackgroundLayers();
				SetupActorLayers();
				
				// Setup Audio Actions
				SetupAudioActions();
				
				// Setup Audio if we need to, also make sure we can see the DialogUI local component (dui)
				if ( screen.soundToLoad != "" && DialogUI.dui != null ){
					// Important to send this to the dui instance otherwise the yield co-routine wont work!
					DialogUI.dui.PlayAudio(screen.soundToLoad, screen.soundPitch);	
				}
				
				// ACTIONS
				CreateObjectsAtStartOfScreen();	
				ActivateObjectsAtStartOfScreen();
				
				// DIALOG TEXT EFFECTS
				DialogUI.dui.SetupDialogTextEffects();
				
				
				// THIRD PARTY START FUNCTIONS
				ThirdPartyStart();
			
			}
		}
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	LOGIC SETUP
//	Uses the Logic to figure out which screen to navigate to
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function LogicSetup() {
	
	// Make sure the logic statements are valid and we have some setup
	if( screen.logicStatements != null && screen.logicStatements.length > 0 && DialogUI != null && DialogUI.dui != null && DialogUI.dui.tokens.length > 0 ){
		
		// Setup a flag to check whether we found a logic event to use.
		var logicFound : boolean = false;
		
		// Loop through the statements
		for( var event : LogicStatements in screen.logicStatements ){
			if(event!=null){
				
				// make sure we can get the token we're requesting
				if( DialogUI.dui.tokens[event.token] != null ){
					
					// Cache token
					var token : String = DialogUI.dui.tokens[event.token].value;
					
					// Helper variables
					var valueAsFloat = floatRef();
					var argumentAsFloat = floatRef();
					var parseFailed : boolean = false;
					var conditionIsTrue : boolean = false;
					
					// EVENT -> EQUALS
					if( event.operator == DS_LOGIC_OPERATOR.Equals ){
						
						// Parse Original Value
						//if( float.TryParse(token, valueAsFloat)){
						if ( DialogUI.ParseTokenAsFloat(token, valueAsFloat) ){							  
						//	 Debug.Log(valueAsFloat);
						}else{
						   Debug.Log("LDC: Unable to parse '{0}'." + token); 
						   parseFailed = true; 
						}
						
						// Parse Argument
						//if( float.TryParse(event.compare, argumentAsFloat)){
						if ( DialogUI.ParseTokenAsFloat(event.compare, argumentAsFloat) ){						  
						//	 Debug.Log(argumentAsFloat);
						}else{
						   Debug.Log("LDC: Unable to parse '{0}'." + event.compare);
						   parseFailed = true;  
						}
						
						// If token matches compare string (as values)
						if( !parseFailed && valueAsFloat.value == argumentAsFloat.value ){
							Debug.Log( "LDC LOGIC MATCH: " + valueAsFloat.value + " == " + argumentAsFloat.value );
							conditionIsTrue = true;
							
						// If token matches compare string
						} else if( parseFailed && token == event.compare ){
							Debug.Log( "LDC LOGIC MATCH: " + token + " == " + event.compare );
							conditionIsTrue = true;
						}
					}
					
					// EVENT -> IS NOT
					else if( event.operator == DS_LOGIC_OPERATOR.IsNot ){
						// Parse Original Value
						//if( float.TryParse(token, valueAsFloat)){	
						if ( DialogUI.ParseTokenAsFloat(token, valueAsFloat) ){	
				  
						//	 Debug.Log(valueAsFloat);
						}else{
						   Debug.Log("LDC: Unable to parse '{0}'." + token); 
						   parseFailed = true; 
						}
						
						// Parse Argument
						//if( float.TryParse(event.compare, argumentAsFloat)){	
						if ( DialogUI.ParseTokenAsFloat(event.compare, argumentAsFloat) ){	
												  
						//	 Debug.Log(argumentAsFloat);
						}else{
						   Debug.Log("LDC: Unable to parse '{0}'." + event.compare);
						   parseFailed = true;  
						}
						
						// If token matches compare string (as values)
						if( !parseFailed && valueAsFloat != argumentAsFloat ){
							Debug.Log( "LDC LOGIC MATCH: " + valueAsFloat.value + " != " + argumentAsFloat.value );
							conditionIsTrue = true;
							
						// If token matches compare string
						} else if( parseFailed && token != event.compare ){
							Debug.Log( "LDC LOGIC MATCH: " + token + " != " + event.compare );
							conditionIsTrue = true;
						}
					}
					
					// EVENT -> GREATER THAN
					else if( event.operator == DS_LOGIC_OPERATOR.GreaterThan ){
						
						// Parse Original Value
						//if( float.TryParse(token, valueAsFloat)){
						if ( DialogUI.ParseTokenAsFloat(token, valueAsFloat) ){	
							  
						//	 Debug.Log(valueAsFloat);
						}else{
						   Debug.Log("LDC: Unable to parse '{0}'." + token); 
						   parseFailed = true; 
						}
						
						// Parse Argument
						//if( float.TryParse(event.compare, argumentAsFloat)){
						if ( DialogUI.ParseTokenAsFloat(event.compare, argumentAsFloat) ){
													  
						//	 Debug.Log(argumentAsFloat);
						}else{
						   Debug.Log("LDC: Unable to parse '{0}'." + event.compare);
						   parseFailed = true;  
						}
						
						// Parse was successful
						if(!parseFailed){
							// If token matches compare string
							if( valueAsFloat.value > argumentAsFloat.value ){
								Debug.Log( "LDC LOGIC MATCH: " + valueAsFloat.value + " > " + argumentAsFloat.value );
								conditionIsTrue = true;
							}
						}
					}
					
					// EVENT -> LOWER THAN
					else if( event.operator == DS_LOGIC_OPERATOR.LessThan ){
						
						// Parse Original Value
						//if( float.TryParse(token, valueAsFloat)){		
						if ( DialogUI.ParseTokenAsFloat(token, valueAsFloat) ){	
			  
						//	 Debug.Log(valueAsFloat);
						}else{
						   Debug.Log("LDC: Unable to parse '{0}'." + token); 
						   parseFailed = true; 
						}
						
						// Parse Argument
						//if( float.TryParse(event.compare, argumentAsFloat)){
						if ( DialogUI.ParseTokenAsFloat(event.compare, argumentAsFloat) ){	
													  
						//	 Debug.Log(argumentAsFloat);
						}else{
						   Debug.Log("LDC: Unable to parse '{0}'." + event.compare);
						   parseFailed = true;  
						}
						
						// Parse was successful
						if(!parseFailed){
							// If token matches compare string
							if( valueAsFloat.value < argumentAsFloat.value ){
								Debug.Log( "LDC LOGIC MATCH: " + valueAsFloat.value + " < " + argumentAsFloat.value );
								conditionIsTrue = true;
							}
						}
					}
					
					// DID THIS CONDITION RESULT TO TRUE?
					if(conditionIsTrue){
						
						// We have found an event to use - this stops the default screen from being used.
						logicFound = true;
						
						// Should we end the navigation dialog now?
						if( event.endDialogAfterThis){
							isActive = false;
				
							// Setup Dialog UI
							DialogUI.isActive = false;
							DialogUI.status = DUISTATUS.ENDED;
							DialogUI.screenDuration = 0;
							
							// Setup Dialog Controller
							dc.status = DCSTATUS.ENDED;
							dc.currentScreen = null;
							dc.currentID = 0;
							
							// Destroy GameObject too?
							if( event.destroyAtEnd ){
								Destroy(gameObject);
							}
						
						// Otherwise, move to the next screen	
						} else {
								
							// Setup the screen to use the default navigation
							dc.status = DCSTATUS.NEXT;
							dc.nextID = event.goToScreen;
							isActive = false;
							DialogUI.status = DUISTATUS.FADEOUT;
						}
						
						// Stop the loop early
						break;
					}
				}
			}
		}
				
		// If no logic was found, lets use the default screen
		if(!logicFound){
			
			Debug.Log( "LDC LOGIC: Using default navigation");
			
			// Should we end the navigation dialog now?
			if(navigation.endDialogAfterThis){
				isActive = false;
	
				// Setup Dialog UI
				DialogUI.isActive = false;
				DialogUI.status = DUISTATUS.ENDED;
				DialogUI.screenDuration = 0;
				
				// Setup Dialog Controller
				dc.status = DCSTATUS.ENDED;
				dc.currentScreen = null;
				dc.currentID = 0;
				
				// Destroy GameObject too?
				if( navigation.destroyAtEnd ){
					Destroy(gameObject);
				}
			
			// Otherwise, move to the next screen	
			} else {
					
				// Setup the screen to use the default navigation
				dc.status = DCSTATUS.NEXT;
				dc.nextID = navigation.logicDefaultNavigation;
				isActive = false;
				DialogUI.status = DUISTATUS.FADEOUT;
			}
			
		}
		
	// if we have no logic setup, use the default screen to navigate to	
	} else {
		
		Debug.Log( "LDC LOGIC: Using default navigation");
		
		// Should we end the navigation dialog now?
		if(navigation.endDialogAfterThis){
			isActive = false;

			// Setup Dialog UI
			DialogUI.isActive = false;
			DialogUI.status = DUISTATUS.ENDED;
			DialogUI.screenDuration = 0;
			
			// Setup Dialog Controller
			dc.status = DCSTATUS.ENDED;
			dc.currentScreen = null;
			dc.currentID = 0;
			
			// Destroy GameObject too?
			if( navigation.destroyAtEnd ){
				Destroy(gameObject);
			}
		
		// Otherwise, move to the next screen	
		} else {
				
			// Setup the screen to use the default navigation
			dc.status = DCSTATUS.NEXT;
			dc.nextID = navigation.logicDefaultNavigation;
			isActive = false;
			DialogUI.status = DUISTATUS.FADEOUT;
		}
	}
	
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	SETUP BACKGROUND LAYERS
//	Applies the correct settings to the DialogUI
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function SetupBackgroundLayers(){

	// Make sure the array is valid
	if( DialogUI != null && DialogUI.dui != null && actions.sceneLayers != null && actions.sceneLayers.length > 0 ){
		
		// SETUP BACKGROUND LAYERS		
		// Loop through the scene Layers
		var counter : int = 0;
		for( var sceneLayer : DialogUIBackgroundLayers in actions.sceneLayers ){
			
			// If we are supposed to setup this layer ..
			if(sceneLayer != null && DialogUI.dui.bgLayers[counter] != null && (sceneLayer.setLayer || actions.fadeAllSceneLayers) ){
				
				// Normal setup if we're not fading out the entire scene
				if(!actions.fadeAllSceneLayers){
					DialogUI.dui.bgLayers[counter].tex = sceneLayer.tex;
					DialogUI.dui.bgLayers[counter].scale = sceneLayer.scale;
					DialogUI.dui.bgLayers[counter].display = sceneLayer.display;
				}
				
				// Instant Transitions
				if( actions.fadeAllSceneLayers ){
					DialogUI.dui.bgLayers[counter].display = DUI_LAYER_STATUS.FadeOut;
					DialogUI.dui.bgLayers[counter].opacity = 1;	
					
				}else if( DialogUI.dui.bgLayers[counter].display == DUI_LAYER_STATUS.FadeIn ){
					DialogUI.dui.bgLayers[counter].opacity = 0;
					
				} else if( DialogUI.dui.bgLayers[counter].display == DUI_LAYER_STATUS.FadeOut ){
					DialogUI.dui.bgLayers[counter].opacity = 1;	
					
				} else if( DialogUI.dui.bgLayers[counter].display == DUI_LAYER_STATUS.Hide ){
					DialogUI.dui.bgLayers[counter].opacity = 0;
					DialogUI.dui.bgLayers[counter].tex = null;
					
				} else if ( DialogUI.dui.bgLayers[counter].display == DUI_LAYER_STATUS.Show ){
					DialogUI.dui.bgLayers[counter].opacity = 1;
				}
			}
			
			// increment counter
			counter++;
			
		}
		
		// POST OPTIMIZATION
		// Check if any background layers are active, then we'll turn on the optimization variable to display the backgrounds.
		var displayBackgroundLayers : boolean = false;
		for(var bgLayer : DialogUIBackgroundLayers in DialogUI.dui.bgLayers ){
			if(bgLayer!=null && bgLayer.display != DUI_LAYER_STATUS.Hide ){
				displayBackgroundLayers = true;
			}
		}
		
		// Set the optimization
		DialogUI.dui.displayBackgroundLayers = displayBackgroundLayers;
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	SETUP BACKGROUND LAYERS
//	Applies the correct settings to the DialogUI
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function SetupActorLayers(){

	// Make sure the array is valid
	if( DialogUI != null && DialogUI.dui != null && actions.actorLayers != null && actions.actorLayers.length > 0 ){
		
		// SETUP BACKGROUND LAYERS		
		// Loop through the scene Layers
		var counter : int = 0;
		for( var actorLayer : DialogUIActorLayers in actions.actorLayers ){
			
			// If we are supposed to setup this layer ..
			if(actorLayer != null && DialogUI.dui.bgActors[counter] != null &&  (actorLayer.setLayer || actions.fadeAllActorLayers) ){
				
				// Normal setup if we're not fading out the entire scene
				if(!actions.fadeAllActorLayers){
					DialogUI.dui.bgActors[counter].tex = actorLayer.tex;
					DialogUI.dui.bgActors[counter].scale = actorLayer.scale;
					DialogUI.dui.bgActors[counter].display = actorLayer.display;
					DialogUI.dui.bgActors[counter].allignment = actorLayer.allignment;
					DialogUI.dui.bgActors[counter].motion = actorLayer.motion;
					DialogUI.dui.bgActors[counter].offset = actorLayer.offset;
					
					// Calculate Size using the original source texture
					if( actorLayer.tex != null ){
						
						// Calculate Rect Size
						DialogUI.dui.bgActors[counter].rect.width = actorLayer.tex.width*( actorLayer.size / 100 );
						DialogUI.dui.bgActors[counter].rect.height = actorLayer.tex.height*( actorLayer.size / 100 );
						
						// Calculate Rect Position
						DialogUI.dui.bgActors[counter].rect = CalculateRectPosition( DialogUI.dui.bgActors[counter].rect, DialogUI.dui.bgActors[counter].allignment, DialogUI.dui.bgActors[counter].offset );
					}
				}
				
				// Instant Transitions
				if( actions.fadeAllActorLayers ){
					DialogUI.dui.bgActors[counter].display = DUI_LAYER_STATUS.FadeOut;
					DialogUI.dui.bgActors[counter].opacity = 1;	
					
				}else if( DialogUI.dui.bgActors[counter].display == DUI_LAYER_STATUS.FadeIn ){
					DialogUI.dui.bgActors[counter].opacity = 0;
					
				} else if( DialogUI.dui.bgActors[counter].display == DUI_LAYER_STATUS.FadeOut ){
					DialogUI.dui.bgActors[counter].opacity = 1;	
					
				} else if( DialogUI.dui.bgActors[counter].display == DUI_LAYER_STATUS.Hide ){
					DialogUI.dui.bgActors[counter].opacity = 0;
					DialogUI.dui.bgActors[counter].tex = null;
					
				} else if ( DialogUI.dui.bgActors[counter].display == DUI_LAYER_STATUS.Show ){
					DialogUI.dui.bgActors[counter].opacity = 1;
				}
			}
			
			// increment counter
			counter++;
			
		}
		
		// POST OPTIMIZATION
		// Check if any background layers are active, then we'll turn on the optimization variable to display the backgrounds.
		var displayActorLayers : boolean = false;
		for(var bgActor : DialogUIActorLayers in DialogUI.dui.bgActors ){
			if(bgActor!=null && bgActor.display != DUI_LAYER_STATUS.Hide ){
				displayActorLayers = true;
			}
		}
		
		// Set the optimization
		DialogUI.dui.displayActorLayers = displayActorLayers;
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	CALCULATE RECT POSITION
//	Using a rect with the width and height already set, and the allignment and offsets sent as args, we'll return a complete rect with a position
//	NOTE: Based on screen res of 960x640
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function CalculateRectPosition( theRect : Rect, pos : DUI_ACTOR_ALLIGN, offset : Vector2 ){
	
	//Debug.Log("Fixing Rect Position");
	
	// TOP LEFT
	if( pos == DUI_ACTOR_ALLIGN.TopLeft ){
		theRect.x = 0;
		theRect.y = 0;
	}
	
	// TOP
	else if( pos == DUI_ACTOR_ALLIGN.Top ){
		theRect.x = (960/2)-(theRect.width/2);
		theRect.y = 0;
	}
	
	// TOP RIGHT
	else if( pos == DUI_ACTOR_ALLIGN.TopRight ){
		theRect.x = 960 - theRect.width;
		theRect.y = 0;
	}
	
	// LEFT
	else if( pos == DUI_ACTOR_ALLIGN.MidLeft ){
		theRect.x = 0;
		theRect.y = (640/2)-(theRect.height/2);
	}
	
	// MIDDLE
	else if( pos == DUI_ACTOR_ALLIGN.Middle ){
		theRect.x = (960/2)-(theRect.width/2);
		theRect.y = (640/2)-(theRect.height/2);
	}
	
	// RIGHT
	else if( pos == DUI_ACTOR_ALLIGN.MidRight ){
		theRect.x = 960 - theRect.width;
		theRect.y = (640/2)-(theRect.height/2);
	}
	
	// BOTTOM LEFT
	else if( pos == DUI_ACTOR_ALLIGN.BotLeft ){
		theRect.x = 0;
		theRect.y = 640 - theRect.height;
	}
	
	// BOTTOM
	else if( pos == DUI_ACTOR_ALLIGN.Bottom ){
		theRect.x = (960/2)-(theRect.width/2);
		theRect.y = 640 - theRect.height;
	}
	
	// BOTTOM RIGHT
	else if( pos == DUI_ACTOR_ALLIGN.BotRight ){
		theRect.x = 960 - theRect.width;
		theRect.y = 640 - theRect.height;
	}
	
	// ADD OFFSET
	theRect.x += offset.x;
	theRect.y += offset.y;
	
	// Returns the complete Rect
	return theRect;
	
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	SETUP AUDIO ACTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function SetupAudioActions(){
	
	// Make sure we can see the DialogUI
	if( DialogUI != null && DialogUI.dui != null ){
			
		// ID 0 - Music Channel
		if( actions.music.action != DSAudioAction.None ){
			DialogUI.dui.SetupAudio( 0, CreateAudioSetupInstance( actions.music ) );
		}
		
		// ID 1 - SFX 1 Channel
		if( actions.sfx1.action != DSAudioAction.None ){
			DialogUI.dui.SetupAudio( 1, CreateAudioSetupInstance( actions.sfx1 ) );
		}
		
		// ID 2 - SFX 2 Channel
		if( actions.sfx2.action != DSAudioAction.None ){
			DialogUI.dui.SetupAudio( 2, CreateAudioSetupInstance( actions.sfx2 ) );
		}
		
		// ID 3 - SFX 3 Channel
		if( actions.sfx3.action != DSAudioAction.None ){
			DialogUI.dui.SetupAudio( 3, CreateAudioSetupInstance( actions.sfx3 ) );
		}
	
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	CREATE AUDIO SETUP INSTANCE
//	Creates an instance of the DSAudioSetup class and returns it
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function CreateAudioSetupInstance( setup : DSAudioSetup ){
	
	// Create a new class
	var newSetup : DSAudioSetup = new DSAudioSetup();
	
	// Copy the values from the original setup
	newSetup.source = setup.source;
	newSetup.action = setup.action;
	newSetup.useAudioPath = setup.useAudioPath;
	newSetup.playFromPath = setup.playFromPath;
	newSetup.clip = setup.clip;
	newSetup.volume = setup.volume;
	newSetup.currentVolume = setup.currentVolume;
	newSetup.pitch = setup.pitch;
	newSetup.loop = setup.loop;
	newSetup.fadeDuration = setup.fadeDuration;

	// Return the instance
	return newSetup;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	THE DIALOGUI HAS REPORTED THE USER JUST PRESSED THE SKIP BUTTON
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Skip(){
		
	// Make sure we're not forcing the dialogUI close
	if ( DialogUI.status != DUISTATUS.FORCECLOSE ){
	
		// End the dialog now
		if( navigation.endDialogAfterThis ){
			
			// Setup Screen
			isActive = false;
			
			// Setup Dialog UI
			DialogUI.isActive = false;
			DialogUI.status = DUISTATUS.ENDED;
			DialogUI.screenDuration = 0;
			
			// Setup Dialog Controller
			dc.status = DCSTATUS.ENDED;
			dc.currentScreen = null;
			dc.currentID = 0;
			
		// Next Screen	
		} else {
			dc.status = DCSTATUS.NEXT;
			dc.nextID = navigation.screenToLoadOnNext;
			//dc.FindDialog( navigation.screenToLoadOnNext );
			isActive = false;
			DialogUI.status = DUISTATUS.FADEOUT;
		}
		
		// Actions
		CreateObjectsAtEndOfScreen();
		ActivateObjectsAtEndOfScreen();
		DestroyObjectsAtEndOfScreen();
		
		ThirdPartyEnd();
		
		// Destroy This dialog object at end
		if ( navigation.endDialogAfterThis && navigation.destroyAtEnd ){
			Destroy(gameObject);
		}
	}
	
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	THE DIALOGUI HAS REPORTED THE USER JUST PRESSED THE SKIP BUTTON
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function MultipleChoiceNext( mcID : int ){
	
	// Make sure we're not forcing the dialogUI close
	if ( DialogUI.status != DUISTATUS.FORCECLOSE ){
	
		// End the dialog now
		if( navigation.endDialogAfterThis ){
			
			// Setup Screen
			isActive = false;
			
			// Setup Dialog UI
			DialogUI.isActive = false;
			DialogUI.status = DUISTATUS.ENDED;
			DialogUI.screenDuration = 0;
			
			// Setup Dialog Controller
			dc.status = DCSTATUS.ENDED;
			dc.currentScreen = null;
			dc.currentID = 0;
			
		// Next Screen	
		} else {
			dc.status = DCSTATUS.NEXT;
			dc.nextID = navigation.multipleButtons[mcID];
			//dc.FindDialog( navigation.screenToLoadOnNext );
			isActive = false;
			DialogUI.status = DUISTATUS.FADEOUT;
		}
		
		// Actions
		CreateObjectsAtEndOfScreen();
		ActivateObjectsAtEndOfScreen();
		DestroyObjectsAtEndOfScreen();
		
		ThirdPartyEnd();
		
		// Destroy This dialog object at end
		if ( navigation.endDialogAfterThis && navigation.destroyAtEnd ){
			Destroy(gameObject);
		}
	}
	
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	THE DIALOGUI HAS REPORTED THE USER JUST PRESSED THE YES BUTTON
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Yes(){
	
	// Make sure we're not forcing the dialogUI close
	if ( DialogUI.status != DUISTATUS.FORCECLOSE ){
		
		// End the dialog now
		if( navigation.endDialogAfterThis ){
			
			// Setup Screen
			isActive = false;
			
			// Setup Dialog UI
			DialogUI.isActive = false;
			DialogUI.status = DUISTATUS.ENDED;
			DialogUI.screenDuration = 0;
			
			// Setup Dialog Controller
			dc.status = DCSTATUS.ENDED;
			dc.currentScreen = null;
			dc.currentID = 0;
			
		// Next Screen	
		} else {
			dc.status = DCSTATUS.NEXT;
			dc.nextID = navigation.screenToLoadOnYes;
			isActive = false;
			DialogUI.status = DUISTATUS.FADEOUT;
		}
		
		// Actions
		CreateObjectsAtEndOfScreen();
		ActivateObjectsAtEndOfScreen();
		DestroyObjectsAtEndOfScreen();
		
		ThirdPartyEnd();
		
		// Destroy This dialog object at end
		if ( navigation.endDialogAfterThis && navigation.destroyAtEnd ){
			Destroy(gameObject);
		}
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	THE DIALOGUI HAS REPORTED THE USER JUST PRESSED THE YES BUTTON
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function No(){
	
	// Make sure we're not forcing the dialogUI close
	if ( DialogUI.status != DUISTATUS.FORCECLOSE ){
		
		// End the dialog now
		if( navigation.endDialogAfterThis ){
			
			// Setup Screen
			isActive = false;
			
			// Setup Dialog UI
			DialogUI.isActive = false;
			DialogUI.status = DUISTATUS.ENDED;
			DialogUI.screenDuration = 0;
			
			// Setup Dialog Controller
			dc.status = DCSTATUS.ENDED;
			dc.currentScreen = null;
			dc.currentID = 0;
			
		// Next Screen	
		} else {
			dc.status = DCSTATUS.NEXT;
			dc.nextID = navigation.screenToLoadOnNo;
			//dc.FindDialog( navigation.screenToLoadOnNo );
			isActive = false;
			DialogUI.status = DUISTATUS.FADEOUT;
		}
		
		// Actions
		CreateObjectsAtEndOfScreen();
		ActivateObjectsAtEndOfScreen();
		DestroyObjectsAtEndOfScreen();
		
		ThirdPartyEnd();
		
		// Destroy This dialog object at end
		if ( navigation.endDialogAfterThis && navigation.destroyAtEnd ){
			Destroy(gameObject);
		}
	
	}
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	CREATE OBJECTS AT START OF SCREEN
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function CreateObjectsAtStartOfScreen(){
	
	// If this has been setup, run it!
	if ( actions.createObjectsAtStart.length > 0 ) {
						
		// Loop through the objects
		for(var i=0; i < actions.createObjectsAtStart.length; i++){
				
			// if the array item has actually been setup ..
			if (actions.createObjectsAtStart[i].createObject != null ) {
						
				// default position for creating objects 
				var createTransform = this.transform;
						
				// If there is a position to create this object, setup the variable.
				if ( actions.createObjectsAtStart[i].createLocation != null ) {
						
					createTransform = actions.createObjectsAtStart[i].createLocation;
				}
						
				// If there is a position to create this object, setup the variable.
				if ( GameObject.Find( actions.createObjectsAtStart[i].findGameObjectLocation ) != null) {
						
					createTransform = GameObject.Find( actions.createObjectsAtStart[i].findGameObjectLocation ).transform;
				}
						
				// Create the Object
				var theObject : GameObject = Instantiate(actions.createObjectsAtStart[i].createObject, createTransform.position, createTransform.rotation);
						
			} 
		}	
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	CREATE OBJECTS AT END OF SCREEN
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function CreateObjectsAtEndOfScreen(){
	
	// If this has been setup, run it!
	if ( actions.createObjectsAtEnd.length > 0 ) {
						
		// Loop through the objects
		for(var i=0; i < actions.createObjectsAtEnd.length; i++){
				
			// if the array item has actually been setup ..
			if ( actions.createObjectsAtEnd[i].createObject != null ) {
						
				// default position for creating objects 
				var createTransform = this.transform;
						
				// If there is a position to create this object, setup the variable.
				if ( actions.createObjectsAtEnd[i].createLocation != null ) {
						
					createTransform = actions.createObjectsAtEnd[i].createLocation;
				}
						
				// If there is a position to create this object, setup the variable.
				if ( GameObject.Find( actions.createObjectsAtEnd[i].findGameObjectLocation ) != null) {
						
					createTransform = GameObject.Find( actions.createObjectsAtEnd[i].findGameObjectLocation ).transform;
				}
						
				// Create the Object
				var theObject = Instantiate(actions.createObjectsAtEnd[i].createObject, createTransform.position, createTransform.rotation);
						
			} 
		}	
	}
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	ACTIVATE OBJECTS AT START OF SCREEN
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function ActivateObjectsAtStartOfScreen(){

	// Activate Objects On Start
	if ( actions.activateTheseObjectsAtStart.length > 0 ) {
		
		// Loop through objects and activate them
		for ( var toFind : String in actions.activateTheseObjectsAtStart ) {
			
			// If we have setup a name to search for
			if ( toFind != null ) {
			
				// cache the object
				var toActivateAtStart : GameObject = GameObject.Find(toFind);
			
				// If the object was found, activate it.
				if ( toActivateAtStart != null ) {
					
					#if UNITY_3_4
					    toActivateAtStart.SetActiveRecursively(true);
					#elif UNITY_3_5
					    toActivateAtStart.SetActiveRecursively(true);
					#else
						// Unity 4 or higher!
					   // toActivateAtStart.SetActive(true);
					#endif
					
				}
			}
		}	
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	ACTIVATE OBJECTS AT END OF SCREEN
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function ActivateObjectsAtEndOfScreen(){
	
	// Activate Objects On Destroy
	if ( actions.activateTheseObjectsAtEnd.length > 0 ) {
	
		// Loop through objects and activate them
		for ( var toActivate : GameObject in actions.activateTheseObjectsAtEnd ) {
		
			if ( toActivate != null ) {
				
				#if UNITY_3_4
				    toActivate.SetActiveRecursively(true);
				#elif UNITY_3_5
				    toActivate.SetActiveRecursively(true);
				#else
					// Unity 4 or higher!
				  // toActivate.SetActive(true);
				#endif
			}
		}	
	}
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	DESTROY OBJECTS AT END OF SCREEN
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function DestroyObjectsAtEndOfScreen(){
	
	// Destroy these objects on destroy
	if ( actions.findAndDestroyTheseObjectsAtEnd.length > 0 ) {
	
		// Loop through these objects and delete them
		for ( var destroyObject : String in actions.findAndDestroyTheseObjectsAtEnd ) {
			
			// make sure this isnt an empty reference
			if ( GameObject.Find(destroyObject) != null ) {
				
				var destroyThis : GameObject = GameObject.Find(destroyObject);
				Destroy(destroyThis);
			}
		}
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	THIRD PARTY START FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function ThirdPartyStart(){
	
	// ================
	//	USEQUENCER
	// ================
	
	// Make sure the reference to the uSequencer gameObject is figured out straight away.
	if( actions.uSequencer.go == null && actions.uSequencer.findGo != "" && GameObject.Find(actions.uSequencer.findGo)!=null){
		actions.uSequencer.go = GameObject.Find(actions.uSequencer.findGo);
	}
	
	// Do actions if we've references a uSequencer GameObject
	if(actions.uSequencer.go != null){
		
		// Setup Speed And Rate
		if(actions.uSequencer.setup){
			actions.uSequencer.go.SendMessage("SetPlaybackTime",actions.uSequencer.setPlaybackTime);
			actions.uSequencer.go.SendMessage("SetPlaybackRate",actions.uSequencer.setPlaybackRate);
		}
		
		// ==============
		// START ACTIONS
		// ==============
		
		// Play / Resume
		if(actions.uSequencer.startAction == DSuSequencerActionType.Play){
			actions.uSequencer.go.SendMessage("Play", SendMessageOptions.DontRequireReceiver);
		}
		
		// Pause
		else if(actions.uSequencer.startAction == DSuSequencerActionType.Pause){
			actions.uSequencer.go.SendMessage("Pause", SendMessageOptions.DontRequireReceiver);
		}
		
		// Stop
		else if(actions.uSequencer.startAction == DSuSequencerActionType.Stop){
			actions.uSequencer.go.SendMessage("Stop", SendMessageOptions.DontRequireReceiver);
		}
		
		// Skip
		else if(actions.uSequencer.startAction == DSuSequencerActionType.Skip){
			actions.uSequencer.go.SendMessage("Skip", SendMessageOptions.DontRequireReceiver);
		}
		
	}
	
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	THIRD PARTY END FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function ThirdPartyEnd(){
	
	// ================
	//	USEQUENCER
	// ================
	
	// Do actions if we've references a uSequencer GameObject
	if(actions.uSequencer.go != null){
		
		// ==============
		// END ACTIONS
		// ==============
				
		// Play / Resume
		if(actions.uSequencer.endAction == DSuSequencerActionType.Play){
			actions.uSequencer.go.SendMessage("Play", SendMessageOptions.DontRequireReceiver);
		}
		
		// Pause
		else if(actions.uSequencer.endAction == DSuSequencerActionType.Pause){
			actions.uSequencer.go.SendMessage("Pause", SendMessageOptions.DontRequireReceiver);
		}
		
		// Stop
		else if(actions.uSequencer.endAction == DSuSequencerActionType.Stop){
			actions.uSequencer.go.SendMessage("Stop", SendMessageOptions.DontRequireReceiver);
		}
		
		// Skip
		else if(actions.uSequencer.endAction == DSuSequencerActionType.Skip){
			actions.uSequencer.go.SendMessage("Skip", SendMessageOptions.DontRequireReceiver);
		}
		
	}
	
}