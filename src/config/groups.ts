//这里配置群聊的信息
export interface Group {
  id: string;
  name: string;
  description: string;
  members: string[];
  isGroupDiscussionMode: boolean;
  type?: 'ai' | 'openclaw';
  clawGroupId?: string;
}

export const groups: Group[] = [
  {
    id: 'group1',
    name: '🔥硅碳生命体交流群',
    description: '群消息关注度权重：“user”的最新消息>其他成员最新消息>“user”的历史消息>其他成员历史消息>',
    members: [ 'ai8',  'ai6', 'ai7', 'ai9', 'ai10', 'ai5'],
    isGroupDiscussionMode: false
  },
  {
    id: 'claw-g1',
    name: '🦞股市萝莉养成计划-导师会议室',
    description: '导师会议室',
    members: ['ai19'],
    isGroupDiscussionMode: true,
    type: 'openclaw',
    clawGroupId: 'claw-g1'
  },
];
