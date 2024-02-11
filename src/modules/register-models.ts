import Adapter from "@/lib/Adapter";
import DataModel from "@/models/DataModel";
import Account from "@/models/Account";
import AuthProvider from "@/models/AuthProvider";
import Job from "@/models/Job";
import Role from "@/models/Role";
import SearchConfig from "@/models/SearchConfig";
import Key from "@/models/Key";
import Media from "@/models/Media";
import MergeRequest from "@/models/MergeRequest";
import MergeRequestEvent from "@/models/MergeRequestEvent";
import Sockethook from "@/models/Sockethook";
import Token from "@/models/Token";
import Invitation from "@/models/Invitation";
import Environment from "@/models/Environment";
import Settings from "@/models/Settings";

Adapter.registerModel(Account);
Adapter.registerModel(AuthProvider);
Adapter.registerModel(DataModel);
Adapter.registerModel(Environment);
Adapter.registerModel(Invitation);
Adapter.registerModel(Job);
Adapter.registerModel(Key);
Adapter.registerModel(Media);
Adapter.registerModel(MergeRequest);
Adapter.registerModel(MergeRequestEvent);
Adapter.registerModel(Role);
Adapter.registerModel(SearchConfig);
Adapter.registerModel(Settings);
Adapter.registerModel(Sockethook);
Adapter.registerModel(Token);
