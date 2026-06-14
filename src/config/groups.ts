export const groups = [
  {
    id: 'group_loli',
    name: '股市萝莉养成计划-导师会议室',
    description: '研究如何训练一个超级基金经理 AI 智能体的导师会议室',
    members: ['ai19', 'ai20', 'ai21', 'ai23'],
    isGroupDiscussionMode: false
  }
] as const;

export type GroupId = typeof groups[number]['id'];
